'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateMemberStatusAction(membershipId: string, newStatus: string) {
    await requireAdmin()

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { error } = await supabase
            .from('memberships')
            .update({ status: newStatus })
            .eq('id', membershipId)

        if (error) {
            console.error('Error updating member status:', error)
            return { success: false, error: 'Failed to update member status' }
        }

        revalidatePath('/admin/members')
        return { success: true }
    } catch (err: any) {
        console.error('updateMemberStatusAction unexpected error:', err)
        return { success: false, error: err.message || 'Unauthorized' }
    }
}
