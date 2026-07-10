'use server'

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { requireAdmin } from "@/lib/auth"

export async function getMemberDetails(profileId: string) {
    await requireAdmin()

    try {
        const supabase = createAdminClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // 1. Fetch Enrollments first so we have them ready
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select(`
                id,
                status,
                progress,
                enrolled_at,
                courses (
                    title,
                    level
                )
            `)
            .eq('user_id', profileId)
            .order('enrolled_at', { ascending: false })

        if (enrollmentsError) console.error('Error fetching enrollments:', enrollmentsError)

        // 2. Fetch Internships
        const { data: internships, error: internshipsError } = await supabase
            .from('internships')
            .select('*')
            .eq('user_id', profileId)
            .order('created_at', { ascending: false })

        if (internshipsError) console.error('Error fetching internships:', internshipsError)

        // 3. Fetch Membership by user_id (profile ID)
        const { data: membership, error: membershipError } = await supabase
            .from('memberships')
            .select(`
                *,
                profiles (*)
            `)
            .eq('user_id', profileId)
            .maybeSingle()

        // If no membership row exists yet build a minimal stub so the sheet still renders
        if (membershipError) throw membershipError
        if (!membership) {
            // Fetch profile directly so we can still show contact info etc.
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single()
            if (profileError) throw profileError
            return {
                success: true,
                data: {
                    id: null,
                    user_id: profileId,
                    status: 'pending',
                    category: 'student',
                    nic_id: null,
                    created_at: profile.created_at,
                    profile,
                    payments: [],
                    documents: [],
                    cpd: [],
                    enrollments: enrollments || [],
                    internships: internships || []
                }
            }
        }

        // 4. Fetch Payments
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('membership_id', membership.id)
            .order('created_at', { ascending: false })

        if (paymentsError) console.error('Error fetching payments:', paymentsError)

        // 5. Fetch Documents
        const { data: documents, error: documentsError } = await supabase
            .from('documents')
            .select('*')
            .eq('membership_id', membership.id)

        if (documentsError) console.error('Error fetching documents:', documentsError)

        // 6. Fetch CPD Activities
        const { data: cpd_activities, error: cpdError } = await supabase
            .from('cpd_activities')
            .select('*')
            .eq('membership_id', membership.id)
            .order('activity_date', { ascending: false })

        if (cpdError) console.error('Error fetching CPD:', cpdError)

        return {
            success: true,
            data: {
                ...membership,
                profile: membership.profiles,
                payments: payments || [],
                documents: documents || [],
                cpd: cpd_activities || [],
                enrollments: enrollments || [],
                internships: internships || []
            }
        }
    } catch (err: any) {
        console.error('getMemberDetails unexpected error:', err)
        return { success: false, error: err.message || 'Unauthorized' }
    }
}
