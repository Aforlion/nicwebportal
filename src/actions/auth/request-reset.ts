'use server'

import { createClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { sendPasswordResetEmail } from "@/lib/email"
import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"

export async function requestPasswordResetAction(email: string) {
    const normalizedEmail = email?.trim().toLowerCase()
    if (!normalizedEmail) return { success: false, error: "Email is required" }

    try {
        // Rate Limiting: 10 reset attempts per minute per IP
        const headerList = await headers()
        const ip = (headerList.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
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

        // 2. Check if user exists and get their profile name (using admin client to bypass RLS)
        console.log(`[requestPasswordResetAction] Checking profile for: ${normalizedEmail}`)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .ilike('email', normalizedEmail)
            .maybeSingle()

        if (profileError) {
            console.warn(`[requestPasswordResetAction] Profile check warning:`, profileError.message)
        }

        // 3. Generate the recovery link using canonical www domain to avoid 307 redirect drops
        const rawBaseUrl = env.NEXT_PUBLIC_APP_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.nicnigeria.org')
        const baseUrl = rawBaseUrl.replace(/\/$/, '').replace('https://nicnigeria.org', 'https://www.nicnigeria.org')

        console.log(`[requestPasswordResetAction] Generating recovery link for: ${normalizedEmail}`)
        const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: normalizedEmail,
            options: {
                redirectTo: `${baseUrl}/reset-password`
            }
        })

        if (linkError) {
            console.error("[requestPasswordResetAction] Link Generation Error:", linkError)
            const msg = String(linkError.message || '').toLowerCase()
            if (msg.includes('not found') || msg.includes('unable to locate')) {
                return {
                    success: false,
                    error: "No portal account was found for that email address. Please check for typos (or middle initials/numbers) or contact NIC support."
                }
            }
            return { success: false, error: `Auth link error: ${linkError.message}` }
        }

        // 4. Construct scanner-safe token_hash link so email security prefetchers cannot burn the one-time token
        const hashedToken = data?.properties?.hashed_token
        const resetUrl = hashedToken
            ? `${baseUrl}/reset-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
            : data?.properties?.action_link

        if (resetUrl) {
            console.log(`[requestPasswordResetAction] Sending email via Resend to: ${normalizedEmail}`)
            const emailResult = await sendPasswordResetEmail(
                normalizedEmail,
                profile?.full_name || "Member",
                resetUrl
            )

            if (!emailResult.success) {
                console.error("[requestPasswordResetAction] Resend Error:", emailResult.error)
                return { success: false, error: `Email delivery error: ${JSON.stringify(emailResult.error)}` }
            }
            console.log(`[requestPasswordResetAction] Email sent successfully.`)
        } else {
            console.error("[requestPasswordResetAction] No action link or token hash generated in properties")
            return { success: false, error: "Failed to generate access link" }
        }

        return { success: true }
    } catch (err: any) {
        console.error("[requestPasswordResetAction] Unexpected Error:", err)
        return { success: false, error: `Unexpected error: ${err.message}` }
    }
}
