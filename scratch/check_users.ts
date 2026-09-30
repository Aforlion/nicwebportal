import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    const emails = ['jamesrauta070@gmail.com', 'activelawrence@gmail.com']
    for (const email of emails) {
        console.log(`\n=== Checking: ${email} ===`)
        const { data: profile } = await adminClient
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle()
        console.log('Profile:', profile)

        if (profile) {
            const { data: memberships } = await adminClient
                .from('memberships')
                .select('*')
                .eq('user_id', profile.id)
            console.log('Memberships:', memberships)

            if (memberships && memberships.length > 0) {
                const memIds = memberships.map(m => m.id)
                const { data: payments } = await adminClient
                    .from('payments')
                    .select('*')
                    .in('membership_id', memIds)
                console.log('Payments by membership_id:', payments)
            }

            const { data: enrollments } = await adminClient
                .from('enrollments')
                .select('*')
                .eq('user_id', profile.id)
            console.log('Enrollments:', enrollments)

            if (enrollments && enrollments.length > 0) {
                const refs = enrollments.map(e => e.payment_reference).filter(Boolean)
                const { data: matchedPayments } = await adminClient
                    .from('payments')
                    .select('*')
                    .in('transaction_reference', refs)
                console.log('Payments matched by enrollment refs:', matchedPayments)
            }
        }
    }
}

main().catch(console.error)
