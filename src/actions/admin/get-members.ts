'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getMembers() {
    await requireAdmin()
    try {

        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Fetch profiles joined with memberships
        // We use left join because some profiles might not have a membership record yet
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                email,
                role,
                created_at,
                memberships (
                    id,
                    nic_id,
                    category,
                    status,
                    joined_date
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching members:', error)
            return { error: 'Failed to fetch members' }
        }

        // Flatten data for easier use in the UI
        const members = data.map((profile: any) => {
            const membership = profile.memberships?.[0] || null
            
            // Map category based on profile role if no membership exists, or use the membership category
            let category = 'Student'
            if (profile.role === 'facility_admin' || membership?.category === 'institutional' || membership?.category === 'facility_admin') {
                category = 'facility_admin'
            } else if (membership?.category) {
                category = membership.category
            } else if (profile.role === 'admin' || profile.role === 'super_admin') {
                category = 'admin'
            } else if (profile.role === 'member') {
                category = 'professional'
            }

            return {
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                role: profile.role,
                memberID: membership?.nic_id || 'N/A',
                category: category,
                status: membership?.status || 'Pending',
                joinDate: membership?.joined_date || profile.created_at
            }
        })

        return { members }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
