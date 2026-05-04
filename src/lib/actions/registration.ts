"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { cookies, headers } from "next/headers"
import { verifyTransaction } from "@/lib/payments/paystack"
import { sendRegistrationEmail } from "../email"
import { FoundingRegistrationSchema, IndividualRegistrationSchema, FacilityRegistrationSchema } from "../validations"
import logger from "@/lib/logger"
import { env } from "@/env"
import { checkRateLimit } from "@/lib/rate-limit"
import { createClient } from "@supabase/supabase-js"

export async function savePendingRegistrationAction(data: {
    email: string,
    formData: any,
    registrationType: string
}) {
    try {
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') ?? 'unknown';
        const isAllowed = await checkRateLimit('auth', `pending-reg:${ip}`);
        if (!isAllowed) {
            logger.warn("Rate limit exceeded for pending registration", { ip, email: data.email });
            return { success: false, error: "Too many requests. Please try again later." };
        }

        logger.info("Saving pending registration", { email: data.email, type: data.registrationType });
        // Validation based on type
        if (data.registrationType === 'individual') {
            IndividualRegistrationSchema.parse(data.formData)
        } else if (data.registrationType === 'facility') {
            FacilityRegistrationSchema.parse(data.formData)
        }

        const supabase = createServerClient(await cookies())
        const { data: record, error } = await supabase
            .from('pending_registrations')
            .insert({
                email: data.email,
                form_data: data.formData,
                registration_type: data.registrationType
            })
            .select()
            .single()

        if (error) throw error
        return { success: true, id: record.id }
    } catch (e: any) {
        logger.error("Save Pending Error", { error: e.message, email: data.email });
        return { success: false, error: e.message || "Validation failed" }
    }
}

export async function finalizeRegistrationAction(reference: string) {
    try {
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') ?? 'unknown';
        const isAllowed = await checkRateLimit('auth', `finalize-reg:${ip}`);
        if (!isAllowed) {
            logger.warn("Rate limit exceeded for registration finalization", { ip, reference });
            return { success: false, message: "Too many requests. Please try again later." };
        }

        logger.info("Finalizing registration payment", { reference });
        // 1. Verify Transaction with Paystack
        const verification = await verifyTransaction(reference)
        if (!verification.success || verification.data.status !== "success") {
            logger.warn("Paystack verification failed", { reference, verification });
            return { success: false, message: "Payment verification failed." }
        }

        const metadata = verification.data.metadata
        const email = verification.data.customer.email
        const type = metadata?.registration_type

        logger.info("Payment verified", { reference, type, email });

        const supabase = createServerClient(await cookies())
        const adminClient = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        if (type === 'founding') {
            const token = metadata?.token
            // 1. Verify Invitation
            const { data: invitation, error: invError } = await supabase
                .from('membership_invitations')
                .select('*')
                .eq('token', token)
                .single()

            if (invError || !invitation) {
                return { success: false, message: "Invitation not found." }
            }

            // 2. Mark Invitation as Paid & Update Details
            const { error: updateError } = await supabase
                .from('membership_invitations')
                .update({
                    paid_at: new Date().toISOString(),
                    payment_reference: reference,
                    payment_amount: verification.data.amount / 100, // Convert back from kobo
                    paid_recapitalization: (verification.data.amount / 100) > 12000
                })
                .eq('token', token)

            if (updateError) {
                logger.error("Update Invitation Error", { error: updateError, token, reference });
                return { success: false, message: "Failed to update payment status." }
            }

            logger.info("Founding registration finalized", { token, reference });
            return { success: true, type: 'founding', token: token }
        }

        if (type === 'individual') {
            const pendingId = metadata?.pending_id
            if (!pendingId) {
                logger.error("Missing pending_id in metadata", { reference });
                return { success: false, message: "Missing registration context." }
            }

        // 1. Get Pending Data (using service role to bypass RLS)
        const { data: pending, error: pError } = await adminClient
            .from('pending_registrations')
            .select('*')
            .eq('id', pendingId)
            .single()

        if (pError || !pending) {
            logger.error("Registration record not found", { pendingId, error: pError });
            return { success: false, message: "Registration record not found." }
        }
            if (pending.status === 'completed' || pending.status === 'paid') {
                logger.info("Registration already completed", { pendingId });
                return { success: true, message: "Already completed." }
            }

            const fd = pending.form_data

            // Validate form data again
            try {
                IndividualRegistrationSchema.parse(fd);
            } catch (err: any) {
                return { success: false, message: "Invalid form data: " + err.message };
            }

            // Map category to role appropriately
            let assignedRole = 'member';
            if (fd.category === 'student') {
                assignedRole = 'student';
            }

            // 3. Create User Account in Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: fd.password,
                options: {
                    data: {
                        full_name: fd.fullName,
                        role: assignedRole
                    }
                }
            });

            if (signUpError || !authData.user) {
                logger.error("Student Auth Creation Error", { error: signUpError, email, pendingId });
                return { success: false, message: "Failed to create account: " + (signUpError?.message || "User creation failed.") };
            }

            // 3.1 Confirm Email using Admin API (idempotent after payment)
            await adminClient.auth.admin.updateUserById(authData.user.id, { email_confirm: true })

            // 3.5 Create Membership Record
            const { error: membershipError } = await supabase
                .from('memberships')
                .insert({
                    user_id: authData.user.id,
                    category: fd.category, // Matches DB enum now
                    status: 'active',
                    is_active: true,
                    paid_at: new Date().toISOString(),
                    last_payment_reference: reference,
                    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                });

            if (membershipError) {
                logger.error("Membership Creation Error", { error: membershipError, email, pendingId });
                // We'll continue anyway as auth is created, but log it
            }

            await adminClient
                .from('pending_registrations')
                .update({
                    status: 'completed', // Using completed to match facility behavior and ensure idempotency
                    payment_reference: reference,
                })
                .eq('id', pendingId)

            // 4. Send Confirmation Email
            const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';
            await sendRegistrationEmail(email, fd.fullName, undefined, `${baseUrl}/login`)

            logger.info("Individual registration finalized", { email, pendingId, reference });
            return { success: true, type: 'individual', fullName: fd.fullName }
        }

        if (type === 'facility') {
            const pendingId = metadata?.pending_id
            if (!pendingId) {
                logger.error("Missing pending_id for facility registration", { reference });
                return { success: false, message: "Missing registration context." }
            }

            // 1. Get Pending Data (using service role)
            const { data: pending, error: pError } = await adminClient
                .from('pending_registrations')
                .select('*')
                .eq('id', pendingId)
                .single()

            if (pError || !pending) {
                logger.error("Facility registration record not found", { pendingId, error: pError });
                return { success: false, message: "Registration record not found." }
            }
            if (pending.status === 'completed') {
                logger.info("Facility registration already completed", { pendingId });
                return { success: true, message: "Already completed." }
            }

            const fd = pending.form_data

            // Validate form data again
            try {
                FacilityRegistrationSchema.parse(fd);
            } catch (err: any) {
                return { success: false, message: "Invalid facility data: " + err.message };
            }

            // 2. Create the Auth User (Owner)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: fd.ownerEmail,
                password: fd.password,
                options: {
                    data: {
                        full_name: fd.ownerFullName,
                        role: 'member'
                    }
                }
            })

            if (authError || !authData.user) {
                logger.error("Facility Owner Signup Error", { error: authError, email: fd.ownerEmail, pendingId });
                return { success: false, message: authError?.message || "Failed to create owner account." }
            }

            // 2.1 Confirm Email using Admin API
            await adminClient.auth.admin.updateUserById(authData.user.id, { email_confirm: true })

            // 3. Create Facility via existing action
            const result = await registerFacilityAction({
                ownerId: authData.user.id,
                facilityName: fd.facilityName,
                regNumber: fd.regNumber,
                tin: fd.tin,
                facilityType: fd.facilityType,
                email: fd.email,
                phone: fd.phone,
                address: fd.address,
                state: fd.state,
                city: fd.city,
                capacity: parseInt(fd.capacity) || 0
            })

            if (!result.success) {
                return { success: false, message: result.error || "Failed to create facility record." }
            }

            // 4. Create Institutional Membership
            const { error: membershipError } = await supabase
                .from('memberships')
                .insert({
                    user_id: authData.user.id,
                    category: 'institutional',
                    status: 'active',
                    is_active: true,
                    paid_at: new Date().toISOString(),
                    last_payment_reference: reference,
                    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                });

            if (membershipError) {
                logger.error("Facility Membership Creation Error", { error: membershipError, pendingId });
            }

            // 4. Mark Pending as Completed
            await adminClient
                .from('pending_registrations')
                .update({
                    status: 'completed',
                    payment_reference: reference
                })
                .eq('id', pendingId)

            // 5. Send Welcome Email
            const { sendFacilityRegistrationEmail } = await import("../email")
            await sendFacilityRegistrationEmail(fd.ownerEmail, fd.ownerFullName, fd.facilityName)

            return { success: true, type: 'facility', facilityName: fd.facilityName }
        }

        return { success: true, message: "Payment verified." }
    } catch (error: any) {
        console.error("Finalize Registration Error:", error)
        return { success: false, message: error.message || "An error occurred." }
    }
}

export async function sendWelcomeEmailAction(email: string, fullName: string, temporaryPassword?: string) {
    try {
        const { sendRegistrationEmail } = await import("../email")
        return await sendRegistrationEmail(email, fullName, temporaryPassword)
    } catch (error: any) {
        console.error("Welcome Email Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendFacilityRegistrationEmailAction(email: string, ownerName: string, facilityName: string) {
    try {
        const { sendFacilityRegistrationEmail } = await import("../email")
        await sendFacilityRegistrationEmail(email, ownerName, facilityName)
        return { success: true }
    } catch (error: any) {
        console.error("Facility Email Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendRegistrationStatusAction(
    email: string,
    fullName: string,
    status: 'approved' | 'denied' | 'action_required',
    reason?: string,
    nicId?: string
) {
    try {
        const { sendRegistrationStatusEmail } = await import("../email")
        await sendRegistrationStatusEmail(email, fullName, status, reason, nicId)
        return { success: true }
    } catch (error: any) {
        console.error("Registration Status Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendFacilityStatusAction(
    email: string,
    facilityName: string,
    ownerName: string,
    status: 'approved' | 'denied' | 'action_required',
    reason?: string,
    regNumber?: string
) {
    try {
        const { sendFacilityStatusEmail } = await import("../email")
        await sendFacilityStatusEmail(email, facilityName, ownerName, status, reason, regNumber)
        return { success: true }
    } catch (error: any) {
        console.error("Facility Status Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendFoundingInvitationAction(email: string, fullName: string, onboardingUrl: string) {
    try {
        const { sendFoundingInvitationEmail } = await import("../email")
        return await sendFoundingInvitationEmail(email, fullName, onboardingUrl)
    } catch (error: any) {
        console.error("Founding Invitation Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendFoundingWelcomeAction(email: string, fullName: string) {
    try {
        const { sendFoundingWelcomeEmail } = await import("../email")
        return await sendFoundingWelcomeEmail(email, fullName)
    } catch (error: any) {
        console.error("Founding Welcome Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendInspectionScheduledAction(
    email: string,
    facilityName: string,
    ownerName: string,
    scheduledDate: string,
    scheduledTime: string,
    inspectorName?: string
) {
    try {
        const { sendInspectionScheduledEmail } = await import("../email")
        await sendInspectionScheduledEmail(email, facilityName, ownerName, scheduledDate, scheduledTime, inspectorName)
        return { success: true }
    } catch (error: any) {
        console.error("Inspection Scheduled Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendFoundingPaymentReceiptAction(
    email: string,
    fullName: string,
    amount: string,
    reference: string
) {
    try {
        const { sendFoundingPaymentReceiptEmail } = await import("../email")
        await sendFoundingPaymentReceiptEmail(email, fullName, amount, reference)
        return { success: true }
    } catch (error: any) {
        console.error("Founding Payment Receipt Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function registerFacilityAction(data: {
    ownerId: string,
    facilityName: string,
    regNumber: string,
    tin: string,
    facilityType: string,
    email: string,
    phone: string,
    address: string,
    state: string,
    city: string,
    capacity: number
}) {
    try {
        const supabase = createServerClient(cookies())

        // 1. Double check and Upsert Profile just in case trigger was slow (idempotent)
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: data.ownerId,
                email: data.email,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            console.error("Server Profile Sync Warning:", profileError)
        }

        // 2. Create the facility record
        const { data: facility, error: facilityError } = await supabase
            .from('facilities')
            .insert({
                name: data.facilityName,
                registration_number: data.regNumber,
                tin: data.tin,
                facility_type: data.facilityType,
                email: data.email,
                phone: data.phone,
                address: data.address,
                state: data.state,
                city: data.city,
                capacity: data.capacity,
                owner_id: data.ownerId,
                status: 'pending'
            })
            .select()
            .single()

        if (facilityError) {
            console.error("Server Facility Creation Error:", facilityError)
            return { success: false, error: facilityError.message }
        }

        return { success: true, facilityId: facility.id }
    } catch (error: any) {
        console.error("Register Facility Action Error:", error)
        return { success: false, error: error.message || "An unexpected error occurred." }
    }
}


