'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getMemberDocuments() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'Membership record not found. Contact support.' }

    const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('membership_id', membership.id)
        .order('uploaded_at', { ascending: false })

    if (error) {
        console.error('Error fetching documents:', error)
        return { error: 'Failed to fetch documents' }
    }

    const formattedDocuments = (documents ?? []).map(doc => ({
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type,
        uploadDate: new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size',
        status: (doc.status ?? 'pending').charAt(0).toUpperCase() + (doc.status ?? 'pending').slice(1),
        url: doc.file_url,
    }))

    return { documents: formattedDocuments }
}

/**
 * Saves a document record in the DB after the client has already uploaded
 * the file to Supabase Storage and obtained the public URL.
 */
export async function saveDocumentRecord(payload: {
    documentName: string
    documentType: string
    fileUrl: string
    fileSize: number
    mimeType: string
}) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'Membership record not found' }

    const { error } = await supabase.from('documents').insert({
        membership_id: membership.id,
        document_name: payload.documentName,
        document_type: payload.documentType,
        file_url: payload.fileUrl,
        file_size: payload.fileSize,
        mime_type: payload.mimeType,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
    })

    if (error) {
        console.error('Error saving document record:', error)
        return { error: 'Failed to save document record' }
    }

    revalidatePath('/portal', 'layout')
    return { success: true }
}

export async function deleteDocumentRecord(documentId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: doc } = await supabase
        .from('documents')
        .select('id')
        .eq('id', documentId)
        .single()

    if (!doc) return { error: 'Document not found' }

    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

    if (error) {
        console.error('Error deleting document:', error)
        return { error: 'Failed to delete document' }
    }

    revalidatePath('/portal', 'layout')
    return { success: true }
}
