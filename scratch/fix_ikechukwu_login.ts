import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const supabaseClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
    const email = "ikechukwuamalu2@gmail.com"
    const newPassword = "NicStudent@2026!"

    console.log(`=== Resolving Login Issue for ${email} ===`)

    // 1. Get user from Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
        console.error("List users error:", listError)
        return
    }

    const authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!authUser) {
        console.error(`User ${email} not found in Supabase Auth`)
        return
    }

    console.log(`[AUTH USER FOUND] ID: ${authUser.id}. Updating password and confirming email...`)

    // 2. Reset / Set Password and confirm email in Supabase Auth
    const { data: updateResult, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        {
            password: newPassword,
            email_confirm: true,
            user_metadata: {
                ...authUser.user_metadata,
                email_verified: true,
                role: 'student'
            }
        }
    )

    if (updateError) {
        console.error("Failed to update user auth record:", updateError.message)
        return
    }

    console.log(`[AUTH RECORD UPDATED] Password set to temporary credentials for ${email}`)

    // 3. Ensure profile and membership are synced and intact
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

    console.log("[PROFILE VERIFIED]:", profile?.full_name, profile?.role)

    const { data: membership } = await supabaseAdmin
        .from('memberships')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

    console.log("[MEMBERSHIP VERIFIED]:", membership?.nic_id, membership?.status)

    // 4. Test actual login with standard Supabase client (matching production loginAction)
    console.log("\nTesting signInWithPassword with client key...")
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: newPassword
    })

    if (loginError) {
        console.error("❌ TEST LOGIN FAILED:", loginError.message)
    } else {
        console.log("✅ TEST LOGIN SUCCESSFUL!")
        console.log("Authenticated User ID:", loginData.user.id)
        console.log("Authenticated Email:", loginData.user.email)
        console.log("Session Access Token Issued:", !!loginData.session.access_token)
    }

    console.log("\n=== RECOVERY SUMMARY ===")
    console.log(`Email: ${email}`)
    console.log(`Temporary Password: ${newPassword}`)
    console.log(`NIC ID: ${membership?.nic_id || 'N/A'}`)
}

main().catch(console.error)
