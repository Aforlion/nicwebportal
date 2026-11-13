'use server'

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { requireAdmin } from "@/lib/auth"

export async function getAdminFacilitiesAction(statusFilter?: string) {
    await requireAdmin()
    try {
        const supabase = createAdminClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        let query = supabase
            .from('facilities')
            .select('*')
            .order('registered_at', { ascending: false })

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter)
        }

        const { data: facilities, error } = await query
        if (error) {
            console.error('Error fetching facilities in getAdminFacilitiesAction:', error)
            return { error: error.message }
        }

        // Fetch overall breakdown counts across all institutions
        const { data: allData, error: statsError } = await supabase.from('facilities').select('status')
        const stats = { total: 0, active: 0, pendingInspection: 0, pendingReview: 0, suspended: 0 }
        
        if (allData) {
            stats.total = allData.length
            allData.forEach((f: any) => {
                if (f.status === 'active') stats.active++
                else if (f.status === 'pending_inspection') stats.pendingInspection++
                else if (f.status === 'pending') stats.pendingReview++
                else if (f.status === 'suspended' || f.status === 'revoked') stats.suspended++
            })
        }

        return { facilities: facilities || [], stats }
    } catch (err: any) {
        console.error('Failed to get admin facilities:', err)
        return { error: err.message || 'Failed to fetch facilities' }
    }
}

