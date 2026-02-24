"use server"

import { createClient } from "@/lib/supabase"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { verifyTransaction } from "@/lib/payments/paystack"
import { sendRegistrationEmail } from "../email"

export async function savePendingRegistrationAction(data: {
    email: string,
    formData: any,
    registrationType: string
}) {
    try {
        const supabase = createClient()
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
        console.error("Save Pending Error:", e)
        return { success: false, error: e.message }
    }
}

export async function finalizeRegistrationAction(reference: string) {
    try {
        // 1. Verify Transaction with Paystack
        const verification = await verifyTransaction(reference)
        if (!verification.success || verification.data.status !== "success") {
            return { success: false, message: "Payment verification failed." }
        }

        const metadata = verification.data.metadata
        const email = verification.data.customer.email
        const type = metadata?.registration_type

        const supabase = createClient()

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
                    paid_recapitalization: (verification.data.amount / 100) > 200
                })
                .eq('token', token)

            if (updateError) {
                console.error("Update Invitation Error:", updateError)
                return { success: false, message: "Failed to update payment status." }
            }

            return { success: true, type: 'founding', token: token }
        }

        if (type === 'individual') {
            const pendingId = metadata?.pending_id
            if (!pendingId) return { success: false, message: "Missing registration context." }

            // 1. Get Pending Data
            const { data: pending, error: pError } = await supabase
                .from('pending_registrations')
                .select('*')
                .eq('id', pendingId)
                .single()

            if (pError || !pending) return { success: false, message: "Registration record not found." }
            if (pending.status === 'completed') return { success: true, message: "Already completed." }

            const fd = pending.form_data

            // 2. Create User Profile (assuming Auth is handled by user login or we create a ghost account)
            // For MVP, we might just update the pending record and wait for admin approval
            // OR create the membership record if the user already has an account.

            // 3. Create User Account if not exists (or update status)
            // For MVP, we generate a temporary password for the email
            const tempPassword = `NIC-${Math.random().toString(36).slice(-6)}${Math.floor(Math.random() * 10)}`;

            await supabase
                .from('pending_registrations')
                .update({
                    status: 'paid',
                    payment_reference: reference,
                    // We can store the temp password temporarily in metadata if we want, 
                    // but for now we just send it in the email.
                })
                .eq('id', pendingId)

            // 4. Send Confirmation Email with Access Details
            await sendRegistrationEmail(email, fd.fullName, tempPassword)

            return { success: true, type: 'individual', fullName: fd.fullName }
        }

        if (type === 'facility') {
            const pendingId = metadata?.pending_id
            if (!pendingId) return { success: false, message: "Missing registration context." }

            // 1. Get Pending Data
            const { data: pending, error: pError } = await supabase
                .from('pending_registrations')
                .select('*')
                .eq('id', pendingId)
                .single()

            if (pError || !pending) return { success: false, message: "Registration record not found." }
            if (pending.status === 'completed') return { success: true, message: "Already completed." }

            const fd = pending.form_data

            // 2. Create the Auth User (Owner)
            // Note: On server side we use the admin client or standard client
            // We'll use the supabase-js signUp which is already handled by the trigger 
            // for profile creation.
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
                console.error("Facility Owner Signup Error during callback:", authError)
                // If user already exists, we might need to link them, but for now we error
                return { success: false, message: authError?.message || "Failed to create owner account." }
            }

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

            // 4. Mark Pending as Completed
            await supabase
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
        await sendRegistrationEmail(email, fullName, temporaryPassword)
        return { success: true }
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
        await sendFoundingInvitationEmail(email, fullName, onboardingUrl)
        return { success: true }
    } catch (error: any) {
        console.error("Founding Invitation Action Error:", error)
        return { success: false, error: error.message }
    }
}

export async function sendFoundingWelcomeAction(email: string, fullName: string) {
    try {
        const { sendFoundingWelcomeEmail } = await import("../email")
        await sendFoundingWelcomeEmail(email, fullName)
        return { success: true }
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


