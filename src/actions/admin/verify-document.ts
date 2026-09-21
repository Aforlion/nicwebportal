'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function verifyDocumentAction(
    documentId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string
) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from('documents')
            .update({
                status,
                verified_by: user?.id || null,
                verified_at: new Date().toISOString(),
                rejection_reason: status === 'rejected' ? (rejectionReason || 'Document did not satisfy verification requirements') : null
            })
            .eq('id', documentId)

        if (error) {
            console.error('Error verifying document:', error)
            return { error: 'Failed to update document verification status' }
        }

        revalidatePath('/admin/members')
        revalidatePath('/admin/registry/facilities')
        revalidatePath('/admin/action-center')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
