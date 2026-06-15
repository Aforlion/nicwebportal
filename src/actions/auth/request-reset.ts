'use server'

import { createClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { sendPasswordResetEmail } from "@/lib/email"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { cookies, headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"

export async function requestPasswordResetAction(email: string) {
    if (!email) return { success: false, error: "Email is required" }

    try {
        // Rate Limiting: 10 reset attempts per minute per IP
        const headerList = await headers()
        const ip = headerList.get('x-forwarded-for') ?? 'unknown'
        const isAllowed = await checkRateLimit('email', `reset-request:${ip}`)
        if (!isAllowed) {
            return { success: false, error: "Too many reset attempts. Please try again later." }
        }

        // 1. Initialize admin client
        const supabaseAdmin = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 2. Check if user exists and get their profile name
        console.log(`[requestPasswordResetAction] Checking profile for: ${email}`)
        const cookieStore = await cookies()
        const supabase = createServerClient(cookieStore)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('email', email)
            .single()

        if (profileError) {
            console.warn(`[requestPasswordResetAction] Profile check warning (might not exist):`, profileError.message)
        }

        // 3. Generate the recovery link
        const baseUrl = env.NEXT_PUBLIC_APP_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://nicnigeria.org')
        console.log(`[requestPasswordResetAction] Generating recovery link for: ${email}`)
        const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${baseUrl}/reset-password`
            }
        })

        if (linkError) {
            console.error("[requestPasswordResetAction] Link Generation Error:", linkError)
            return { success: false, error: `Auth link error: ${linkError.message}` }
        }

        // 4. Send custom email via Resend
        if (data?.properties?.action_link) {
            console.log(`[requestPasswordResetAction] Sending email via Resend to: ${email}`)
            const emailResult = await sendPasswordResetEmail(
                email,
                profile?.full_name || "Member",
                data.properties.action_link
            )

            if (!emailResult.success) {
                console.error("[requestPasswordResetAction] Resend Error:", emailResult.error)
                return { success: false, error: `Email delivery error: ${JSON.stringify(emailResult.error)}` }
            }
            console.log(`[requestPasswordResetAction] Email sent successfully.`)
        } else {
            console.error("[requestPasswordResetAction] No action link generated in properties")
            return { success: false, error: "Failed to generate access link" }
        }

        return { success: true }
    } catch (err: any) {
        console.error("[requestPasswordResetAction] Unexpected Error:", err)
        return { success: false, error: `Unexpected error: ${err.message}` }
    }
}
