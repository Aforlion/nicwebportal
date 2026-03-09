'use server'

import { createClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { sendPasswordResetEmail } from "@/lib/email"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function requestPasswordResetAction(email: string) {
    if (!email) return { success: false, error: "Email is required" }

    try {
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
        const cookieStore = await cookies()
        const supabase = createServerClient(cookieStore)
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('email', email)
            .single()

        // 3. Generate the recovery link
        const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${env.NEXT_PUBLIC_APP_URL}/portal/profile/reset-password`
            }
        })

        if (linkError) {
            console.error("[requestPasswordResetAction] Link Generation Error:", linkError)
            // Still return success to prevent email enumeration, or return a generic message
            return { success: true }
        }

        // 4. Send custom email via Resend
        if (data?.properties?.action_link) {
            await sendPasswordResetEmail(
                email,
                profile?.full_name || "Member",
                data.properties.action_link
            )
        }

        return { success: true }
    } catch (err: any) {
        console.error("[requestPasswordResetAction] Unexpected Error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}
