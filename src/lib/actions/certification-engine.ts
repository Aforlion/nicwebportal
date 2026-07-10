'use server'

import { createClient } from "@supabase/supabase-js"
import { env } from "@/env"

export async function evaluateNCNAEligibilityAction(userId: string) {
    try {
        const adminClient = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // 1. Fetch all student enrollments joined with courses
        const { data: enrollments, error: enrollError } = await adminClient
            .from('enrollments')
            .select(`
                id,
                status,
                course_id,
                courses (
                    title,
                    level
                )
            `)
            .eq('user_id', userId)

        if (enrollError) throw enrollError

        // 2. Fetch all approved internships for the user
        const { data: internships, error: internError } = await adminClient
            .from('internships')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'approved')

        if (internError) throw internError

        // 3. Evaluate criteria
        let hasFundamental = false
        let hasAdvanced = false
        const hasApprovedInternship = (internships || []).length > 0

        if (enrollments) {
            enrollments.forEach((enroll: any) => {
                const title = (enroll.courses?.title || '').toLowerCase()
                const level = (enroll.courses?.level || '').toLowerCase()
                const isCompleted = enroll.status === 'completed' || enroll.progress >= 100

                if (isCompleted) {
                    // Fundamental criteria: level contains beginner/foundation/level1/level2 or title contains fundamental/level 1/level 2
                    if (
                        level.includes('beginner') || 
                        level.includes('foundation') || 
                        level.includes('level 1') || 
                        level.includes('level 2') ||
                        title.includes('fundamental') ||
                        title.includes('level 1') ||
                        title.includes('level 2')
                    ) {
                        hasFundamental = true
                    }
                    // Advanced criteria: level contains advanced/specialty/expert/professional/level 3/level 4 or title contains advanced/specialty/expert/level 3/level 4
                    else if (
                        level.includes('advanced') ||
                        level.includes('specialty') ||
                        level.includes('expert') ||
                        level.includes('professional') ||
                        level.includes('level 3') ||
                        level.includes('level 4') ||
                        title.includes('advanced') ||
                        title.includes('specialty') ||
                        title.includes('expert') ||
                        title.includes('level 3') ||
                        title.includes('level 4')
                    ) {
                        hasAdvanced = true
                    }
                }
            })
        }

        console.log(`NCNA Eligibility Check for User ${userId}:`, { hasFundamental, hasAdvanced, hasApprovedInternship })

        // 4. Issue NCNA Certificate if eligible and not already issued
        if (hasFundamental && hasAdvanced && hasApprovedInternship) {
            // Check if already has NCNA certificate
            const { data: existingCert } = await adminClient
                .from('certificates')
                .select('id')
                .eq('user_id', userId)
                .eq('type', 'ncna')
                .maybeSingle()

            if (!existingCert) {
                const randomId = Math.floor(10000 + Math.random() * 90000)
                const certificateNumber = `NCNA-2026-${randomId}`
                const verificationUrl = `/verify/${certificateNumber}`

                const { error: certError } = await adminClient
                    .from('certificates')
                    .insert({
                        certificate_number: certificateNumber,
                        user_id: userId,
                        type: 'ncna',
                        verification_url: verificationUrl,
                        metadata: {
                            issued_by: "National Institute of Caregivers (NIC Nigeria)",
                            accreditation_authority: "NIC Nigeria Certification Authority",
                            note: "Issued by the National Institute of Caregivers (NIC Nigeria) as the Certification Authority."
                        }
                    })

                if (certError) throw certError
                console.log(`Successfully issued NCNA Certificate ${certificateNumber} to user ${userId}!`)
                return { success: true, issued: true, certificateNumber }
            }
        }

        return { success: true, issued: false }
    } catch (e: any) {
        console.error("evaluateNCNAEligibilityAction error:", e.message)
        return { success: false, error: e.message }
    }
}
