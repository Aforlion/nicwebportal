"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies, headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"
import logger from "@/lib/logger"

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { success: false, error: "Email and password are required" }
    }

    try {
        const headerList = await headers()
        const ip = headerList.get('x-forwarded-for') ?? 'unknown'

        // Rate Limiting: 5 attempts per minute per IP
        const isAllowed = await checkRateLimit('auth', `login:${ip}`)
        if (!isAllowed) {
            logger.warn("Login Rate Limit Exceeded", { ip, email })
            return { success: false, error: "Too many login attempts. Please try again later." }
        }

        const supabase = createClient(await cookies())
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            logger.warn("Login Failed", { email, error: error.message, ip })
            return { success: false, error: error.message }
        }

        // Fetch profile to determine role for redirection if needed on the client
        const { data: profile } = await supabase
            .from('profiles')
            .select(`
                role,
                memberships (
                    category
                )
            `)
            .eq('id', data.user.id)
            .single()

        const membershipCategory = (profile as any)?.memberships?.[0]?.category

        logger.info("Login Successful", { email, role: profile?.role, category: membershipCategory, ip })

        return {
            success: true,
            user: data.user,
            role: profile?.role,
            category: membershipCategory
        }
    } catch (e: any) {
        logger.error("Login Unexpected Error", { error: e.message, email })
        return { success: false, error: "An unexpected error occurred" }
    }
}
