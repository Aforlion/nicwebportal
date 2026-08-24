'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Ensures a membership record exists for the authenticated user.
 * If missing, auto-creates an active membership record dynamically (self-healing).
 */
async function getOrCreateUserMembershipId(userId: string): Promise<string | null> {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

    if (membership?.id) {
        return membership.id
    }

    // Auto-create missing membership using admin client
    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle()

        const userRole = profile?.role || 'member'
        const year = new Date().getFullYear()
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
        const nicId = userRole === 'student' ? `NIC/STU/${year}/${rand}` : `NIC/MEM/${year}/${rand}`
        let category = 'full'
        if (userRole === 'student') category = 'student'
        else if (userRole === 'facility_admin') category = 'corporate'

        const { data: newMem, error: insertErr } = await supabaseAdmin
            .from('memberships')
            .insert({
                user_id: userId,
                nic_id: nicId,
                category,
                status: 'active',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single()

        if (insertErr) {
            console.error('Failed to auto-create membership for user:', userId, insertErr)
            return null
        }

        return newMem?.id || null
    } catch (err) {
        console.error('Unexpected error in getOrCreateUserMembershipId:', err)
        return null
    }
}

export async function getMemberDocuments() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const membershipId = await getOrCreateUserMembershipId(user.id)
    if (!membershipId) return { error: 'Failed to load or initialize membership record. Please try again.' }

    const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('membership_id', membershipId)
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
 * Saves a document record in the DB after the client has uploaded the file to Supabase Storage.
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

    const membershipId = await getOrCreateUserMembershipId(user.id)
    if (!membershipId) return { error: 'Failed to initialize membership record' }

    const { error } = await supabase.from('documents').insert({
        membership_id: membershipId,
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
