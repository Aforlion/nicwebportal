"use server"

import { createClient } from "@/lib/supabase"
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
                    paid_recapitalization: (verification.data.amount / 100) > 12000
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


