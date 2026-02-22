'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getFacilitiesData() {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Fetch facilities joined with inspections to get last inspection date
        // Note: For now we'll fetch facilities and handle inspection dates in mapping
        const { data, error } = await supabase
            .from('facilities')
            .select(`
                *,
                inspections (
                    conducted_at,
                    scheduled_at
                )
            `)
            .order('registered_at', { ascending: false })

        if (error) {
            console.error('Error fetching facilities:', error)
            return { error: 'Failed to fetch facilities' }
        }

        const facilities = data.map((fac: any) => {
            // Get the most recent inspection date
            const lastInspection = fac.inspections
                ?.filter((i: any) => i.conducted_at)
                .sort((a: any, b: any) => new Date(b.conducted_at).getTime() - new Date(a.conducted_at).getTime())[0]

            return {
                id: fac.registration_number || fac.id.slice(0, 8).toUpperCase(),
                dbId: fac.id,
                name: fac.name,
                location: `${fac.city ? fac.city + ', ' : ''}${fac.state || ''}`,
                status: fac.compliance_status === 'compliant' ? 'Compliant' :
                    fac.compliance_status === 'under_review' ? 'Pending Inspection' : 'Non-Compliant',
                lastInspection: lastInspection ? new Date(lastInspection.conducted_at).toLocaleDateString('en-CA') : 'N/A',
                staffCount: fac.capacity || 0, // Using capacity as placeholder for staffCount if not in schema
            }
        })

        // Stats
        const stats = {
            total: data.length,
            compliant: data.filter(f => f.compliance_status === 'compliant').length,
            pending: data.filter(f => f.compliance_status === 'under_review').length,
            critical: data.filter(f => f.compliance_status === 'sanctioned').length
        }

        return { facilities, stats }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
