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
        let ip = 'unknown';
        try {
            const headerList = await headers();
            ip = headerList.get('x-forwarded-for') ?? 'unknown';
        } catch (e) {
            logger.warn("Failed to retrieve headers for rate limiting", { error: e });
        }
        
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

        const adminClient = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )
        const { data: record, error } = await adminClient
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
        if (e.name === 'ZodError') {
            return { success: false, error: e.errors.map((err: any) => err.message).join(", ") }
        }
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

            // Check if user already exists in profiles
            const { data: existingProfile } = await adminClient
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle()

            let userId: string
            if (existingProfile) {
                userId = existingProfile.id
                // Update password and metadata for existing user
                const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
                    password: fd.password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: fd.fullName,
                        role: assignedRole
                    }
                })
                if (updateError) {
                    logger.error("Existing User Update Error", { error: updateError, email, pendingId })
                    return { success: false, message: "Failed to update existing account: " + updateError.message }
                }

                 // Explicitly update profile role
                const { error: profError } = await adminClient
                    .from('profiles')
                    .update({
                        role: assignedRole,
                        full_name: fd.fullName,
                        training_facility_id: fd.training_facility_id || null
                    })
                    .eq('id', userId)

                if (profError) {
                    logger.error("Existing Profile Role Update Error", { error: profError, email })
                }
            } else {
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

                userId = authData.user.id
                // 3.1 Confirm Email using Admin API (idempotent after payment)
                await adminClient.auth.admin.updateUserById(userId, { email_confirm: true })

                // Explicitly update profiles with training_facility_id
                const { error: trError } = await adminClient
                    .from('profiles')
                    .update({
                        training_facility_id: fd.training_facility_id || null
                    })
                    .eq('id', userId)

                if (trError) {
                    logger.error("Profile Training Facility Link Error", { error: trError, userId })
                }
            }

            // 3.5 Create Membership Record
            const { error: membershipError } = await supabase
                .from('memberships')
                .insert({
                    user_id: userId,
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

            // Check if owner already exists in profiles
            const { data: existingOwner } = await adminClient
                .from('profiles')
                .select('id')
                .eq('email', fd.ownerEmail)
                .maybeSingle()

            let ownerId: string
            if (existingOwner) {
                ownerId = existingOwner.id
                // Update password and metadata for existing user
                const { error: updateError } = await adminClient.auth.admin.updateUserById(ownerId, {
                    password: fd.password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: fd.ownerFullName,
                        role: 'facility_admin'
                    }
                })
                if (updateError) {
                    logger.error("Existing Owner Update Error", { error: updateError, email: fd.ownerEmail, pendingId })
                    return { success: false, message: "Failed to update owner account: " + updateError.message }
                }

                // Update profile role to facility_admin if not already
                const { error: profError } = await adminClient
                    .from('profiles')
                    .update({ role: 'facility_admin' })
                    .eq('id', ownerId)

                if (profError) {
                    logger.error("Existing Owner Profile Role Update Error", { error: profError, email: fd.ownerEmail })
                }

                // Update existing membership category to institutional
                const { error: memError } = await adminClient
                    .from('memberships')
                    .update({ category: 'institutional' })
                    .eq('user_id', ownerId)

                if (memError) {
                    logger.error("Existing Owner Membership Category Update Error", { error: memError, email: fd.ownerEmail })
                }
            } else {
                // 2. Create the Auth User (Owner) with facility_admin role
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: fd.ownerEmail,
                    password: fd.password,
                    options: {
                        data: {
                            full_name: fd.ownerFullName,
                            role: 'facility_admin'
                        }
                    }
                })

                if (authError || !authData.user) {
                    logger.error("Facility Owner Signup Error", { error: authError, email: fd.ownerEmail, pendingId });
                    return { success: false, message: authError?.message || "Failed to create owner account." }
                }

                ownerId = authData.user.id
                // 2.1 Confirm Email using Admin API
                await adminClient.auth.admin.updateUserById(ownerId, { email_confirm: true })
            }

            // 3. Create Facility via existing action (pass owner details for profile upsert)
            const result = await registerFacilityAction({
                ownerId: ownerId,
                ownerEmail: fd.ownerEmail,
                ownerFullName: fd.ownerFullName,
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

            // 4. Create Institutional Membership (use adminClient to bypass RLS)
            const { error: membershipError } = await adminClient
                .from('memberships')
                .insert({
                    user_id: ownerId,
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
    ownerEmail: string,
    ownerFullName: string,
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
        // Use adminClient (service role) to bypass RLS for server-side facility creation
        const adminClient = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // 1. Upsert Profile with owner details (not facility email) to ensure profile exists
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: data.ownerId,
                email: data.ownerEmail,
                full_name: data.ownerFullName,
                role: 'facility_admin',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            logger.error("Profile upsert failed for facility owner", { error: profileError, ownerId: data.ownerId })
        }

        // 2. Create the facility record using adminClient to bypass RLS
        const { data: facility, error: facilityError } = await adminClient
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
            logger.error("Facility creation failed", { error: facilityError, ownerId: data.ownerId, facilityName: data.facilityName })
            return { success: false, error: facilityError.message }
        }

        logger.info("Facility registered successfully", { facilityId: facility.id, ownerId: data.ownerId })
        return { success: true, facilityId: facility.id }
    } catch (error: any) {
        logger.error("Register Facility Action Error", { error: error.message, ownerId: data.ownerId })
        return { success: false, error: error.message || "An unexpected error occurred." }
    }
}

export async function validateInstitutionCodeAction(code: string) {
    try {
        const adminClient = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )
        const { data: facility, error } = await adminClient
            .from('facilities')
            .select('id, name, status, accreditation_level')
            .eq('institution_code', code.trim())
            .maybeSingle()

        if (error) throw error
        if (!facility) {
            return { success: false, error: "Invalid Institution Code. Please check the code and try again." }
        }
        if (facility.status !== 'active') {
            return { success: false, error: "This institution is not currently active or accredited." }
        }
        return { success: true, name: facility.name, id: facility.id, accreditationLevel: facility.accreditation_level }
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to validate code." }
    }
}



