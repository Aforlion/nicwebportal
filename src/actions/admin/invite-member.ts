'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { env } from "@/env"
import { sendEmail } from "@/lib/email"
import { NICWelcomeEmail } from "@/emails/NIC_Welcome"
import * as React from "react"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function inviteMemberAction(profileId: string) {
    await requireAdmin()

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // 1. Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', profileId)
            .single()

        if (profileError || !profile) {
            return { success: false, error: 'Profile not found' }
        }

        // 2. Generate the recovery/setup link using Admin API
        const supabaseAdmin = createAdminClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: profile.email,
            options: {
                redirectTo: `${env.NEXT_PUBLIC_APP_URL}/portal/profile/reset-password`
            }
        })

        if (linkError) {
            console.error('Error generating setup link:', linkError)
            return { success: false, error: `Auth link error: ${linkError.message}` }
        }

        // 3. Send the orientation email with the generated link
        const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'
        await sendEmail({
            to: profile.email,
            subject: 'Action Required: Set Up Your NIC Member Portal Account',
            template: React.createElement(NICWelcomeEmail, {
                fullName: profile.full_name,
                loginUrl: linkData?.properties?.action_link || `${baseUrl}/login`
            })
        })

        return { success: true }
    } catch (err: any) {
        console.error('inviteMemberAction unexpected error:', err)
        return { success: false, error: err.message || 'Failed to send invitation' }
    }
}
