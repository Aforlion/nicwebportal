'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateFacilityCurriculumStatus(
    facilityId: string,
    status: 'approved' | 'rejected' | 'pending',
    notes?: string
) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data: { user } } = await supabase.auth.getUser()

        // 1. Update curriculum_status in facilities table
        const { error: updateError } = await supabase
            .from('facilities')
            .update({
                curriculum_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', facilityId)

        if (updateError) {
            console.error('Error updating curriculum status:', updateError)
            return { error: 'Failed to update curriculum status' }
        }

        // 2. Log in registry_actions audit trail if table exists
        try {
            await supabase
                .from('registry_actions')
                .insert({
                    target_id: facilityId,
                    target_type: 'facility',
                    action_type: status === 'approved' ? 'approve_curriculum' : 'reject_curriculum',
                    performed_by: user?.id,
                    reason: notes || `Curriculum status updated to ${status}`
                })
        } catch (e) {
            // Audit log is best-effort
            console.warn('Could not insert registry action audit log:', e)
        }

        revalidatePath('/admin/registry/facilities')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
