'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getMemberDocuments() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch the membership ID first
    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'Membership not found' }

    const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('membership_id', membership.id)
        .order('uploaded_at', { ascending: false })

    if (error) {
        console.error('Error fetching documents:', error)
        return { error: 'Failed to fetch documents' }
    }

    const formattedDocuments = documents.map(doc => ({
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type,
        uploadDate: new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : 'Size Unknown',
        status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1),
        url: doc.file_url
    }))

    return { documents: formattedDocuments }
}
