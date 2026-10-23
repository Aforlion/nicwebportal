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
                progress,
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

        // 3. Fetch membership profile for category & verified experience
        const { data: membership } = await adminClient
            .from('memberships')
            .select('category, years_of_experience')
            .eq('user_id', userId)
            .maybeSingle()

        // 4. Evaluate course completions
        let hasFundamentalCourse = false
        let hasSpecializedCourse = false

        if (enrollments) {
            enrollments.forEach((enroll: any) => {
                const title = (enroll.courses?.title || '').toLowerCase()
                const level = (enroll.courses?.level || '').toLowerCase()
                const isCompleted = enroll.status === 'completed' || (enroll.progress != null && enroll.progress >= 100)

                if (isCompleted) {
                    // Fundamental criteria: Level 1 / Foundation / Beginner / Core Standard
                    if (
                        level.includes('beginner') || 
                        level.includes('foundation') || 
                        level.includes('level 1') || 
                        title.includes('fundamental') ||
                        title.includes('level 1')
                    ) {
                        hasFundamentalCourse = true
                    }

                    // Advanced / Specialisation criteria: Level 2 / Specialized / Advanced / Level 3 / Level 4
                    if (
                        level.includes('level 2') ||
                        level.includes('specializ') ||
                        level.includes('specialty') ||
                        level.includes('advanced') ||
                        level.includes('expert') ||
                        level.includes('professional') ||
                        level.includes('level 3') ||
                        level.includes('level 4') ||
                        title.includes('level 2') ||
                        title.includes('specializ') ||
                        title.includes('specialty') ||
                        title.includes('geriatric') ||
                        title.includes('palliative') ||
                        title.includes('advanced') ||
                        title.includes('expert') ||
                        title.includes('level 3') ||
                        title.includes('level 4')
                    ) {
                        hasSpecializedCourse = true
                    }
                }
            })
        }

        // 5. Evaluate Clinical Internship & Experience
        const hasApprovedInternship = (internships || []).length > 0
        let hasExtendedClinicalInternship = false

        if (internships) {
            for (const intern of internships) {
                if (intern.start_date && intern.end_date) {
                    const start = new Date(intern.start_date)
                    const end = new Date(intern.end_date)
                    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                    if (diffDays >= 170) {
                        hasExtendedClinicalInternship = true
                    }
                }
            }
        }

        // 6. Regulatory Exemption Rules (Financial Audit & Regulatory Compliance)
        // Rule 1: Level 1 Exemption - Associate members do not take Fundamentals; they progress directly from Level 2 specialisation + clinical experience
        const memberCategory = (membership?.category || '').toLowerCase()
        const isLevel1Exempt = memberCategory.includes('associate')

        // Rule 2: Level 2 Exemption - Students with Level 1 are exempt from Level 2 if they provide evidence of at least 6 months clinical experience / approved extended internship
        const hasSixMonthsExperience = (membership?.years_of_experience != null && membership.years_of_experience >= 1)
        const isLevel2Exempt = hasExtendedClinicalInternship || hasSixMonthsExperience

        // Final Criteria Resolution (Without generating artificial academic course certificates)
        const hasFundamental = hasFundamentalCourse || isLevel1Exempt
        const hasAdvanced = hasSpecializedCourse || isLevel2Exempt

        const exemptionsApplied: string[] = []
        if (isLevel1Exempt && !hasFundamentalCourse) {
            exemptionsApplied.push("Level 1 Fundamentals Bypassed (Associate Member Category)")
        }
        if (isLevel2Exempt && !hasSpecializedCourse) {
            exemptionsApplied.push("Level 2 Specialisation Bypassed (6+ Months Verified Clinical Experience / Internship)")
        }

        console.log(`NCNA Eligibility Evaluation for User ${userId}:`, {
            hasFundamentalCourse,
            hasSpecializedCourse,
            isLevel1Exempt,
            isLevel2Exempt,
            hasApprovedInternship,
            hasExtendedClinicalInternship,
            hasSixMonthsExperience,
            hasFundamental,
            hasAdvanced,
            exemptionsApplied
        })

        // 7. Issue NCNA Certificate if eligible and not already issued
        if (hasFundamental && hasAdvanced && hasApprovedInternship) {
            // Check if already has NCNA certificate
            const { data: existingCert } = await adminClient
                .from('certificates')
                .select('id, certificate_number')
                .eq('user_id', userId)
                .or('certificate_number.ilike.NCNA-%,course_level.ilike.%NCNA%')
                .maybeSingle()

            if (!existingCert) {
                const randomId = Math.floor(10000 + Math.random() * 90000)
                const certificateNumber = `NCNA-2026-${randomId}`

                const { error: certError } = await adminClient
                    .from('certificates')
                    .insert({
                        certificate_number: certificateNumber,
                        user_id: userId,
                        course_level: 'National Certified Nursing Assistant (NCNA)',
                        is_verified: true,
                        issue_date: new Date().toISOString().split('T')[0]
                    })

                if (certError) throw certError
                console.log(`Successfully issued NCNA Certificate ${certificateNumber} to user ${userId}!`)

                // Send email notification if user details available
                try {
                    const { data: profile } = await adminClient
                        .from('profiles')
                        .select('email, full_name')
                        .eq('id', userId)
                        .maybeSingle()
                    if (profile?.email) {
                        const { sendCertificateEmail } = await import("@/lib/email")
                        await sendCertificateEmail(
                            profile.email,
                            profile.full_name || "Student",
                            "National Certified Nursing Assistant (NCNA) License",
                            certificateNumber
                        )
                    }
                } catch (emailErr: any) {
                    console.warn("Could not dispatch certificate email notification:", emailErr.message)
                }

                return { 
                    success: true, 
                    issued: true, 
                    certificateNumber, 
                    alreadyExists: false,
                    details: { 
                        hasFundamental, 
                        hasAdvanced, 
                        hasApprovedInternship,
                        hasFundamentalCourse,
                        hasSpecializedCourse,
                        isLevel1Exempt,
                        isLevel2Exempt,
                        exemptionsApplied 
                    } 
                }
            } else {
                return { 
                    success: true, 
                    issued: true, 
                    certificateNumber: existingCert.certificate_number, 
                    alreadyExists: true, 
                    details: { 
                        hasFundamental, 
                        hasAdvanced, 
                        hasApprovedInternship,
                        hasFundamentalCourse,
                        hasSpecializedCourse,
                        isLevel1Exempt,
                        isLevel2Exempt,
                        exemptionsApplied 
                    } 
                }
            }
        }

        return { 
            success: true, 
            issued: false, 
            details: { 
                hasFundamental, 
                hasAdvanced, 
                hasApprovedInternship,
                hasFundamentalCourse,
                hasSpecializedCourse,
                isLevel1Exempt,
                isLevel2Exempt,
                exemptionsApplied 
            },
            missingRequirements: [
                !hasFundamental ? 'Level 1 Fundamentals' : null,
                !hasAdvanced ? 'Level 2 Specialisation / Clinical Practicum' : null,
                !hasApprovedInternship ? 'Approved Clinical Internship' : null
            ].filter(Boolean)
        }
    } catch (e: any) {
        console.error("evaluateNCNAEligibilityAction error:", e.message)
        return { success: false, error: e.message }
    }
}
