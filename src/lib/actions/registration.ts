"use server"

import { createClient } from "@/lib/supabase"
import { verifyTransaction } from "@/lib/payments/paystack"

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

            await supabase
                .from('pending_registrations')
                .update({ status: 'paid', payment_reference: reference })
                .eq('id', pendingId)

            return { success: true, type: 'individual', fullName: fd.fullName }
        }

        return { success: true, message: "Payment verified." }
    } catch (error: any) {
        console.error("Finalize Registration Error:", error)
        return { success: false, message: error.message || "An error occurred." }
    }
}
