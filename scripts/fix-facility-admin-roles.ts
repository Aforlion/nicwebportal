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
    const admins = [
        { email: "preshgold231@gmail.com", id: "4e85cccb-ee48-4575-a66a-478ea115b20a" },
        { email: "estherosagiobare@gmail.com", id: "eea06958-df51-4350-ab3a-daa0c4ca7786" },
        { email: "vistingangelsnig@gmail.com", id: "5ea55908-6915-44b4-a0e7-c6210fd85bb4" }
    ]

    for (const admin of admins) {
        console.log(`Fixing role for ${admin.email}...`)
        
        // 1. Update profiles table
        const { error: profileError } = await adminClient
            .from("profiles")
            .update({ role: "facility_admin" })
            .eq("id", admin.id)

        if (profileError) {
            console.error(`Error updating profiles table for ${admin.email}:`, profileError.message)
        } else {
            console.log(`Profiles table updated for ${admin.email}`)
        }

        // 2. Update Supabase Auth user metadata
        const { error: authError } = await adminClient.auth.admin.updateUserById(admin.id, {
            user_metadata: { role: "facility_admin" }
        })

        if (authError) {
            console.error(`Error updating Auth Metadata for ${admin.email}:`, authError.message)
        } else {
            console.log(`Auth metadata updated for ${admin.email}`)
        }
    }
}

run().catch(console.error)
