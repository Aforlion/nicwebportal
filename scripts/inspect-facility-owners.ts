import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
    const emails = ["preshgold231@gmail.com", "estherosagiobare@gmail.com", "vistingangelsnig@gmail.com"]

    for (const email of emails) {
        console.log(`\nInspecting details for: ${email}`)
        const { data: profile } = await adminClient
            .from('profiles')
            .select('id, email, role')
            .eq('email', email)
            .single()

        if (!profile) {
            console.log(`Profile not found for email: ${email}`)
            continue
        }

        console.log(`- Profile ID: ${profile.id}, Role: ${profile.role}`)

        // Check memberships
        const { data: memberships } = await adminClient
            .from('memberships')
            .select('*')
            .eq('user_id', profile.id)

        console.log(`- Memberships found: ${memberships?.length || 0}`)
        if (memberships) {
            memberships.forEach(m => {
                console.log(`  * Membership ID: ${m.id}, Category: ${m.category}, Status: ${m.status}`)
            })
        }
    }
}

run().catch(console.error)
