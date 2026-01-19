'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function issueCertificate(courseId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated" }
    }

    // 1. Verify Enrollment & Progress
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (!enrollment) {
        return { error: "Enrollment not found" }
    }

    // Strict 100% check. (Or we can check if all lessons are completed in progress table if progress is float)
    // Assuming progress is updated correctly.
    if (enrollment.progress < 100) {
        return { error: "Course not yet completed. Please finish all lessons." }
    }

    // 2. Check for existing certificate
    const { data: existing } = await supabase
        .from('certificates')
        .select('certificate_code')
        .eq('enrollment_id', enrollment.id)
        .single()

    if (existing) {
        return { success: true, code: existing.certificate_code }
    }

    // 3. Generate Unique Code
    // Format: NIC-YYYY-[RANDOM]
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    const code = `NIC-${year}-${random}`

    // 4. Issue Certificate
    const { error: insertError } = await supabase
        .from('certificates')
        .insert({
            enrollment_id: enrollment.id,
            certificate_code: code,
            issue_date: new Date().toISOString()
        })

    if (insertError) {
        console.error("Certificate issuance error:", insertError)
        return { error: "Failed to generate certificate. Please try again." }
    }

    return { success: true, code }
}

export async function getCertificateByCode(code: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Fetch certificate with student and course details
    const { data: cert, error } = await supabase
        .from('certificates')
        .select(`
            *,
            enrollments (
                enrolled_at,
                completed_at,
                profiles:user_id (
                    full_name,
                    email
                ),
                courses (
                    title,
                    duration_hours
                )
            )
        `)
        .eq('certificate_code', code)
        .single()

    if (error || !cert) {
        return null
    }

    return cert
}
