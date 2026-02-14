'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getRegistryData() {
    await requireAdmin()
    try {

        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Fetch memberships joined with profiles
        const { data, error } = await supabase
            .from('memberships')
            .select(`
                id,
                nic_id,
                category,
                status,
                expiry_date,
                profiles (
                    full_name,
                    email
                )
            `)
            .not('nic_id', 'is', null) // Only actual registry entries
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching registry data:', error)
            return { error: 'Failed to fetch registry data' }
        }

        const registry = data.map((item: any) => ({
            id: item.nic_id,
            name: item.profiles?.full_name || 'Unknown',
            email: item.profiles?.email || 'N/A',
            type: item.category,
            status: item.status || (new Date(item.expiry_date) < new Date() ? 'Expired' : 'Active'),
            expiry: item.expiry_date,
            specialization: 'General Practice' // Mocked as it's not in schema yet
        }))

        return { registry }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
