'use server'

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function verifyDocumentAction(
    documentId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string
) {
    const adminUser = await requireAdmin()
    try {
        const supabase = createAdminClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { data: updatedDoc, error } = await supabase
            .from('documents')
            .update({
                status,
                verified_by: adminUser?.id || null,
                verified_at: new Date().toISOString(),
                rejection_reason: status === 'rejected' ? (rejectionReason || 'Document did not satisfy verification requirements') : null
            })
            .eq('id', documentId)
            .select()

        if (error) {
            console.error('Error verifying document:', error)
            return { error: 'Failed to update document verification status: ' + error.message }
        }

        if (!updatedDoc || updatedDoc.length === 0) {
            console.warn('No document found with ID:', documentId)
            return { error: 'Document record not found' }
        }

        revalidatePath('/admin/members')
        revalidatePath('/admin/registry/facilities')
        revalidatePath('/admin/action-center')
        return { success: true, document: updatedDoc[0] }
    } catch (err: any) {
        console.error('verifyDocumentAction exception:', err)
        return { error: err.message || 'Unauthorized' }
    }
}
