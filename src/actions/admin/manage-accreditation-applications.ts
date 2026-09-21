'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getAccreditationApplications() {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data, error } = await supabase
            .from('accreditation_applications')
            .select(`
                *,
                facility:facility_id (
                    id,
                    name,
                    registration_number,
                    facility_type,
                    email,
                    phone,
                    state,
                    city,
                    status
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching accreditation applications:', error)
            return { error: 'Failed to fetch accreditation applications' }
        }

        return { applications: data || [] }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}

export async function updateAccreditationApplicationStatus(
    applicationId: string,
    status: 'under_review' | 'approved' | 'rejected',
    reviewerNotes?: string
) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Fetch the application to get facility_id
        const { data: app, error: fetchErr } = await supabase
            .from('accreditation_applications')
            .select('facility_id')
            .eq('id', applicationId)
            .single()

        if (fetchErr || !app) {
            return { error: 'Application not found' }
        }

        // 2. Update application record
        const { error: updateErr } = await supabase
            .from('accreditation_applications')
            .update({
                status,
                reviewed_at: new Date().toISOString(),
                reviewer_notes: reviewerNotes || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId)

        if (updateErr) {
            console.error('Error updating application:', updateErr)
            return { error: 'Failed to update application status' }
        }

        // 3. If approved, update the facility status to compliant / level_1 if appropriate
        if (status === 'approved' && app.facility_id) {
            await supabase
                .from('facilities')
                .update({
                    status: 'active',
                    compliance_status: 'compliant',
                    updated_at: new Date().toISOString()
                })
                .eq('id', app.facility_id)
        } else if (status === 'under_review' && app.facility_id) {
            await supabase
                .from('facilities')
                .update({
                    status: 'pending_inspection',
                    compliance_status: 'under_review',
                    updated_at: new Date().toISOString()
                })
                .eq('id', app.facility_id)
        }

        // 4. Log in registry_actions audit trail
        try {
            await supabase
                .from('registry_actions')
                .insert({
                    target_id: app.facility_id,
                    target_type: 'facility',
                    action_type: status === 'approved' ? 'approve_accreditation' : 'review_accreditation',
                    performed_by: user?.id,
                    reason: reviewerNotes || `Accreditation application status changed to ${status}`
                })
        } catch (e) {
            console.warn('Audit log best effort:', e)
        }

        revalidatePath('/admin/inspections')
        revalidatePath('/admin/action-center')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
