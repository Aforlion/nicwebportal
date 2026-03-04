'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getMemberDetails(membershipId: string) {
    await requireAdmin()

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // 1. Fetch Membership with Profile
        const { data: membership, error: membershipError } = await supabase
            .from('memberships')
            .select(`
                *,
                profiles (*)
            `)
            .eq('id', membershipId)
            .single()

        if (membershipError) throw membershipError

        // 2. Fetch Payments
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('membership_id', membershipId)
            .order('created_at', { ascending: false })

        if (paymentsError) console.error('Error fetching payments:', paymentsError)

        // 3. Fetch Documents
        const { data: documents, error: documentsError } = await supabase
            .from('documents')
            .select('*')
            .eq('membership_id', membershipId)

        if (documentsError) console.error('Error fetching documents:', documentsError)

        // 4. Fetch CPD Activities
        const { data: cpd_activities, error: cpdError } = await supabase
            .from('cpd_activities')
            .select('*')
            .eq('membership_id', membershipId)
            .order('activity_date', { ascending: false })

        if (cpdError) console.error('Error fetching CPD:', cpdError)

        return {
            success: true,
            data: {
                ...membership,
                profile: membership.profiles,
                payments: payments || [],
                documents: documents || [],
                cpd: cpd_activities || []
            }
        }
    } catch (err: any) {
        console.error('getMemberDetails unexpected error:', err)
        return { success: false, error: err.message || 'Unauthorized' }
    }
}
