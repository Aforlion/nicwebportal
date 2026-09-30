import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseAdmin = createClient(url, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function main() {
    const email = "ikechukwuamalu2@gmail.com"
    console.log(`Checking user: ${email}...`)

    // 1. Check Auth Users
    const { data: { users }, error: authErr } = await supabaseAdmin.auth.admin.listUsers()
    if (authErr) {
        console.error("Auth search error:", authErr)
        return
    }

    const authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    console.log("Auth User found:", authUser ? {
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at: authUser.email_confirmed_at,
        banned_until: authUser.banned_until,
        user_metadata: authUser.user_metadata,
        app_metadata: authUser.app_metadata,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        confirmed_at: (authUser as any).confirmed_at
    } : "NOT FOUND IN AUTH")

    // Let's also search for all users with similar email
    const similarUsers = users.filter(u => u.email?.toLowerCase().includes("ikechukwu"))
    console.log("Similar auth emails found:", similarUsers.map(u => ({ id: u.id, email: u.email, confirmed: u.email_confirmed_at })))

    // 2. Check Profiles table
    const { data: profiles, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('email', `%ikechukwu%`)

    console.log("Profiles records found:", profErr ? profErr : profiles)

    // 3. Check Memberships table
    if (authUser) {
        const { data: memberships, error: memErr } = await supabaseAdmin
            .from('memberships')
            .select('*')
            .eq('user_id', authUser.id)

        console.log("Memberships records found:", memErr ? memErr : memberships)
    }
}

main().catch(console.error)
