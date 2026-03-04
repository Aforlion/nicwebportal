'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getFacilityDetails(facilityId: string) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Fetch facility details
        const { data: facility, error: facilityError } = await supabase
            .from('facilities')
            .select('*')
            .eq('id', facilityId)
            .single()

        if (facilityError) {
            console.error('Error fetching facility:', facilityError)
            return { error: 'Facility not found' }
        }

        // Fetch audit trail / actions
        const { data: actions, error: actionsError } = await supabase
            .from('registry_actions')
            .select(`
                *,
                profiles:performed_by (
                    full_name
                )
            `)
            .eq('target_id', facilityId)
            .eq('target_type', 'facility')
            .order('created_at', { ascending: false })

        if (actionsError) {
            console.error('Error fetching registry actions:', actionsError)
        }

        // Fetch related documents (assuming a naming convention or linking table)
        // For now, we'll try to find documents tagged with this facility ID
        const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('*')
            .eq('entity_id', facilityId) // Assuming entity_id links to either member or facility

        if (docsError) {
            console.error('Error fetching documents:', docsError)
        }

        return {
            facility,
            actions: actions || [],
            documents: documents || []
        }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
