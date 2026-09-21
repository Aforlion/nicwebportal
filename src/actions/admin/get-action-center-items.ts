'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export interface ActionCenterSummary {
    totalPending: number
    pendingCurriculums: any[]
    pendingAccreditations: any[]
    pendingDocuments: any[]
    pendingInternships: any[]
}

export async function getActionCenterItems(): Promise<{ data?: ActionCenterSummary; error?: string }> {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // 1. Pending Curriculums
        const { data: curriculums } = await supabase
            .from('facilities')
            .select(`
                id,
                name,
                registration_number,
                facility_type,
                curriculum_url,
                curriculum_status,
                state,
                city,
                updated_at,
                owner_id
            `)
            .eq('curriculum_status', 'pending')
            .not('curriculum_url', 'is', null)
            .order('updated_at', { ascending: false })

        // 2. Pending Accreditation Applications
        const { data: accreditations } = await supabase
            .from('accreditation_applications')
            .select(`
                id,
                facility_id,
                application_data,
                status,
                submitted_at,
                created_at,
                facility:facility_id (
                    id,
                    name,
                    registration_number,
                    facility_type,
                    email,
                    phone,
                    state,
                    city
                )
            `)
            .in('status', ['submitted', 'under_review'])
            .order('created_at', { ascending: false })

        // 3. Pending Documents
        const { data: documents } = await supabase
            .from('documents')
            .select(`
                id,
                membership_id,
                document_name,
                document_type,
                file_url,
                file_size,
                status,
                uploaded_at,
                membership:membership_id (
                    id,
                    nic_id,
                    category,
                    user_id,
                    profile:user_id (
                        full_name,
                        email,
                        role
                    )
                )
            `)
            .eq('status', 'pending')
            .order('uploaded_at', { ascending: false })

        // 4. Pending Internships
        const { data: internships } = await supabase
            .from('internships')
            .select(`
                id,
                user_id,
                facility_id,
                custom_facility_name,
                start_date,
                end_date,
                certificate_url,
                status,
                created_at,
                profile:user_id (
                    full_name,
                    email
                ),
                facility:facility_id (
                    name
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        const pendingCurrs = curriculums || []
        const pendingAccreds = accreditations || []
        const pendingDocs = documents || []
        const pendingInterns = internships || []

        const totalPending = pendingCurrs.length + pendingAccreds.length + pendingDocs.length + pendingInterns.length

        return {
            data: {
                totalPending,
                pendingCurriculums: pendingCurrs,
                pendingAccreditations: pendingAccreds,
                pendingDocuments: pendingDocs,
                pendingInternships: pendingInterns
            }
        }
    } catch (err: any) {
        console.error('Error fetching Action Center items:', err)
        return { error: err.message || 'Unauthorized' }
    }
}
