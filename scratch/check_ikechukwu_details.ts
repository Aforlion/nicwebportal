import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
    const email = "ikechukwuamalu2@gmail.com"
    const userId = "c8d8ca3e-f181-403c-a273-d7f1989f679a"

    // 1. Check Payments
    const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('*')
        .or(`user_id.eq.${userId},email.ilike.${email}`)

    console.log("Payments:", payments)

    // 2. Check Enrollments
    const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('*, courses(title)')
        .eq('user_id', userId)

    console.log("Enrollments:", enrollments)
}

main().catch(console.error)
