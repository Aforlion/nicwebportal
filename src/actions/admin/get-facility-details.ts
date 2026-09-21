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

        // Fetch related documents belonging to the facility owner/admin
        let documents: any[] = []
        if (facility.owner_id) {
            const { data: membership } = await supabase
                .from('memberships')
                .select('id')
                .eq('user_id', facility.owner_id)
                .maybeSingle()

            if (membership) {
                const { data: docs, error: docsError } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('membership_id', membership.id)
                    .order('uploaded_at', { ascending: false })

                if (!docsError && docs) {
                    documents = docs.map(d => ({
                        id: d.id,
                        name: d.document_name,
                        type: d.document_type,
                        url: d.file_url,
                        status: d.status,
                        uploaded_at: d.uploaded_at
                    }))
                }
            }
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
