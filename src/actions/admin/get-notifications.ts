'use server'

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { requireAdmin } from "@/lib/auth"

export interface AdminActivityItem {
    id: string
    category: 'document' | 'member' | 'facility' | 'internship'
    title: string
    description: string
    timestamp: string
    link: string
    status: 'pending' | 'completed' | 'info'
    badgeText?: string
}

export interface AdminNotificationsSummary {
    totalPending: number
    pendingDocsCount: number
    pendingFacilitiesCount: number
    pendingInternshipsCount: number
    activities: AdminActivityItem[]
}

export async function getAdminNotificationsAction(): Promise<{ data?: AdminNotificationsSummary; error?: string }> {
    await requireAdmin()
    try {
        const supabase = createAdminClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // 1. Fetch pending documents
        const { data: pendingDocs } = await supabase
            .from('documents')
            .select(`
                id,
                document_name,
                document_type,
                status,
                uploaded_at,
                created_at,
                membership:membership_id (
                    id,
                    nic_id,
                    category,
                    user_id,
                    profile:user_id (
                        id,
                        full_name,
                        email
                    )
                )
            `)
            .order('uploaded_at', { ascending: false })
            .limit(10)

        // 2. Fetch recent profiles (new members, student signups)
        const { data: recentProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(10)

        // 3. Fetch recent facilities
        const { data: recentFacilities } = await supabase
            .from('facilities')
            .select('id, name, registration_number, facility_type, status, registered_at, updated_at')
            .order('registered_at', { ascending: false })
            .limit(10)

        // 4. Fetch pending internships
        const { data: recentInternships } = await supabase
            .from('internships')
            .select(`
                id,
                custom_facility_name,
                status,
                created_at,
                profile:user_id (
                    full_name
                )
            `)
            .order('created_at', { ascending: false })
            .limit(5)

        const activities: AdminActivityItem[] = []

        // Process Documents
        let pendingDocsCount = 0
        if (pendingDocs) {
            pendingDocs.forEach((doc: any) => {
                const memberProfile = doc.membership?.profile
                const memberName = memberProfile?.full_name || 'Member'
                const isPending = doc.status === 'pending'
                if (isPending) pendingDocsCount++

                activities.push({
                    id: `doc-${doc.id}`,
                    category: 'document',
                    title: isPending ? 'Document Awaiting Verification' : 'Document Verified',
                    description: `${doc.document_name} (${doc.document_type || 'Doc'}) uploaded by ${memberName}`,
                    timestamp: doc.uploaded_at || doc.created_at,
                    link: `/admin/members`,
                    status: isPending ? 'pending' : 'completed',
                    badgeText: isPending ? 'Pending Verification' : 'Verified'
                })
            })
        }

        // Process Facilities
        let pendingFacilitiesCount = 0
        if (recentFacilities) {
            recentFacilities.forEach((fac: any) => {
                const isPending = fac.status === 'pending' || fac.status === 'pending_inspection'
                if (isPending) pendingFacilitiesCount++

                activities.push({
                    id: `fac-${fac.id}`,
                    category: 'facility',
                    title: isPending ? 'Facility Registration On Hold' : 'Institutional Facility Active',
                    description: `${fac.name} (${fac.registration_number || 'New Reg'}) - ${fac.facility_type?.replace('_', ' ')}`,
                    timestamp: fac.registered_at || fac.updated_at,
                    link: `/admin/registry/facilities`,
                    status: isPending ? 'pending' : 'completed',
                    badgeText: fac.status?.replace('_', ' ')
                })
            })
        }

        // Process Member Signups
        if (recentProfiles) {
            recentProfiles.forEach((prof: any) => {
                activities.push({
                    id: `prof-${prof.id}`,
                    category: 'member',
                    title: 'New Member Registered',
                    description: `${prof.full_name || 'New User'} (${prof.email}) joined as ${prof.role}`,
                    timestamp: prof.created_at,
                    link: `/admin/members`,
                    status: 'info',
                    badgeText: prof.role
                })
            })
        }

        // Process Internships
        let pendingInternshipsCount = 0
        if (recentInternships) {
            recentInternships.forEach((intern: any) => {
                const isPending = intern.status === 'pending'
                if (isPending) pendingInternshipsCount++

                activities.push({
                    id: `intern-${intern.id}`,
                    category: 'internship',
                    title: isPending ? 'Internship Submission Pending' : 'Internship Record',
                    description: `${intern.profile?.full_name || 'Caregiver'} completed hours at ${intern.custom_facility_name || 'Facility'}`,
                    timestamp: intern.created_at,
                    link: `/admin/internships`,
                    status: isPending ? 'pending' : 'completed',
                    badgeText: intern.status
                })
            })
        }

        // Sort unified activities chronologically descending
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        const totalPending = pendingDocsCount + pendingFacilitiesCount + pendingInternshipsCount

        return {
            data: {
                totalPending,
                pendingDocsCount,
                pendingFacilitiesCount,
                pendingInternshipsCount,
                activities: activities.slice(0, 20)
            }
        }
    } catch (err: any) {
        console.error('getAdminNotificationsAction error:', err)
        return { error: err.message || 'Failed to fetch admin notifications' }
    }
}

