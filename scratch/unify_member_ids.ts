import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    console.log('=== Starting NIC/STU to NIC/MEM Database Unification ===')

    // 1. Fetch all memberships with STU in nic_id
    const { data: stuMemberships, error } = await adminClient
        .from('memberships')
        .select('id, nic_id, user_id')
        .ilike('nic_id', '%STU%')

    if (error) {
        console.error('Error fetching STU memberships:', error)
        return
    }

    console.log(`Found ${stuMemberships?.length || 0} memberships with STU prefix.`)

    if (stuMemberships && stuMemberships.length > 0) {
        for (const mem of stuMemberships) {
            const unifiedId = mem.nic_id?.replace('/STU/', '/MEM/').replace('STU', 'MEM')
            console.log(`Converting ${mem.nic_id} -> ${unifiedId} (Membership ID: ${mem.id})`)

            const { error: updateErr } = await adminClient
                .from('memberships')
                .update({ nic_id: unifiedId })
                .eq('id', mem.id)

            if (updateErr) {
                console.error(`Failed to update ${mem.id}:`, updateErr)
            } else {
                console.log(`Successfully updated ${mem.id} to ${unifiedId}`)
            }
        }
    }

    console.log('=== Unification Complete ===')
}

main().catch(console.error)
