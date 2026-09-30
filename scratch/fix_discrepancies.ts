import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    console.log('=== Starting Data Cleanup & Fix ===')

    // 1. Fix Rauta James NIC ID
    const { data: rautaProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', 'jamesrauta070@gmail.com')
        .single()

    if (rautaProfile) {
        console.log("Fixing Rauta James's NIC ID to STU prefix...")
        const { error: rErr } = await adminClient
            .from('memberships')
            .update({ nic_id: 'NIC/STU/2026/E8DGT', category: 'student' })
            .eq('user_id', rautaProfile.id)

        if (rErr) console.error('Rauta fix error:', rErr)
        else console.log('Successfully updated Rauta James NIC ID to NIC/STU/2026/E8DGT')
    }

    // 2. Fix Lawrence Moses duplicate memberships and payments
    const { data: lawrenceProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', 'activelawrence@gmail.com')
        .single()

    if (lawrenceProfile) {
        console.log("Cleaning up Lawrence Moses's memberships and payments...")
        const { data: lawrenceMems } = await adminClient
            .from('memberships')
            .select('id, nic_id, created_at')
            .eq('user_id', lawrenceProfile.id)
            .order('created_at', { ascending: true })

        if (lawrenceMems && lawrenceMems.length > 0) {
            // Keep the first primary membership (c8a79592-324f-42e6-b3c2-90933b0c8ef4)
            const primaryMem = lawrenceMems[0]
            console.log('Primary membership ID:', primaryMem.id)

            // Set NIC ID on primary membership
            await adminClient
                .from('memberships')
                .update({
                    nic_id: 'NIC/STU/2026/RK3R6',
                    category: 'student',
                    is_active: true,
                    status: 'active'
                })
                .eq('id', primaryMem.id)

            // Point course payment to primary membership
            const { error: pErr } = await adminClient
                .from('payments')
                .update({ membership_id: primaryMem.id })
                .eq('transaction_reference', '1790677256044')

            if (pErr) console.error('Lawrence payment re-link error:', pErr)
            else console.log('Re-linked course payment 1790677256044 to primary membership', primaryMem.id)

            // Delete duplicate empty memberships
            const duplicateIds = lawrenceMems.slice(1).map(m => m.id)
            if (duplicateIds.length > 0) {
                const { error: delErr } = await adminClient
                    .from('memberships')
                    .delete()
                    .in('id', duplicateIds)

                if (delErr) console.error('Lawrence duplicate deletion error:', delErr)
                else console.log(`Deleted ${duplicateIds.length} duplicate membership rows for Lawrence`)
            }
        }
    }

    console.log('=== Cleanup Complete ===')
}

main().catch(console.error)
