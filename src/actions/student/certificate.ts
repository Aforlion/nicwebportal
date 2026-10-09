'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { sendCertificateEmail } from "@/lib/email"

export async function issueCertificate(courseId: string, targetUserId?: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 1. Resolve User
    let userId: string;
    let userEmail: string;
    let fullName: string;

    if (targetUserId) {
        // Admin/AI-triggered issuance
        userId = targetUserId;
        const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', userId).single();
        userEmail = profile?.email || "";
        fullName = profile?.full_name || "Student";
    } else {
        // Session-triggered issuance
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "User not authenticated" }
        userId = user.id;
        userEmail = user.email || "";
        fullName = user.user_metadata?.full_name || "Student";
    }

    // 2. Fetch enrollment and course details (including level!)
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select(`
            id, 
            progress, 
            program_id,
            course:courses (
                id,
                title,
                level
            )
        `)
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()

    if (!enrollment) {
        return { error: "Enrollment not found" }
    }

    const course = enrollment.course as any;

    if (enrollment.progress < 100) {
        return { error: "Course not yet completed. Please finish all lessons." }
    }

    // 2.5 Ensure all assessments are completely graded and passed
    const { data: submissions } = await supabase
        .from('assessment_submissions')
        .select(`
            status,
            score,
            assessment:assessments (
                passing_score
            )
        `)
        .eq('enrollment_id', enrollment.id)

    if (submissions && submissions.length > 0) {
        for (const sub of submissions) {
            if (sub.status === 'pending') {
                return { error: "One or more of your assessments are still Pending Review. Your certificate will be available once graded." }
            }
            const assessmentObj = Array.isArray(sub.assessment) ? sub.assessment[0] : sub.assessment;
            const passingscore = assessmentObj?.passing_score || 70
            if (sub.score < passingscore) {
                return { error: `You scored ${sub.score}% on an assessment (Requires ${passingscore}%). Please retake failed assessments to unlock your certificate.` }
            }
        }
    }

    // 3. Check for existing certificate (linked either by program or course)
    const orCondition = enrollment.program_id 
        ? `program_id.eq.${enrollment.program_id},course_id.eq.${courseId}`
        : `course_id.eq.${courseId}`;

    const { data: existing } = await supabase
        .from('certificates')
        .select('certificate_number')
        .eq('user_id', userId)
        .or(orCondition)
        .maybeSingle()

    if (existing) {
        await sendCertificateEmail(userEmail, fullName, course.title, existing.certificate_number)
        return { success: true, code: existing.certificate_number }
    }

    // 4. Generate Unique Code
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    const code = `NIC-${year}-${random}`

    // 5. Issue Certificate with Level info (using Admin client to bypass learner RLS restrictions)
    const { error: insertError } = await supabaseAdmin
        .from('certificates')
        .insert({
            user_id: userId,
            program_id: enrollment.program_id,
            course_id: courseId,
            course_level: course.level,
            certificate_number: code,
            issue_date: new Date().toISOString()
        })

    if (insertError) {
        console.error("Certificate issuance error:", insertError)
        return { error: "Failed to generate certificate. Please try again." }
    }

    // 6. Send initial Email
    await sendCertificateEmail(userEmail, fullName, course.title, code)

    return { success: true, code }
}

export async function getCertificateByCode(code: string) {
    const { data: cert, error } = await supabaseAdmin
        .from('certificates')
        .select(`
            *,
            profiles:user_id (
                full_name,
                email
            ),
            programs:program_id (
                title
            ),
            courses:course_id (
                title
            )
        `)
        .eq('certificate_number', code)
        .single()

    if (error || !cert) {
        return null
    }

    let studentId = null
    if (cert.user_id) {
        const { data: mem } = await supabaseAdmin
            .from('memberships')
            .select('nic_id, member_id')
            .eq('user_id', cert.user_id)
            .maybeSingle()

        studentId = mem?.nic_id || mem?.member_id || null
    }

    return {
        ...cert,
        student_id: studentId
    }
}

export async function getStudentCertificates() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    const { evaluateNCNAEligibilityAction } = await import("@/lib/actions/certification-engine")
    await evaluateNCNAEligibilityAction(user.id)

    const { data, error } = await supabase
        .from('certificates')
        .select(`
            *,
            programs (title),
            courses (title)
        `)
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false })

    if (error) {
        console.error("Error fetching certificates:", error)
        return { error: "Failed to fetch certificates" }
    }

    return { certificates: data }
}

export async function getStudentTranscript(targetUserId?: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    let userId: string;
    let fallbackEmail: string = "";

    if (targetUserId) {
        userId = targetUserId;
    } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "Unauthenticated" }
        userId = user.id;
        fallbackEmail = user.email || "";
    }

    const dbClient = targetUserId ? supabaseAdmin : supabase;

    // Fetch user profile
    const { data: profile } = await dbClient
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', userId)
        .maybeSingle()

    // Fetch membership student ID
    const { data: membership } = await dbClient
        .from('memberships')
        .select('nic_id, member_id, membership_tier, created_at')
        .eq('user_id', userId)
        .maybeSingle()

    // Fetch certificates
    const { data: certs } = await dbClient
        .from('certificates')
        .select('certificate_number, course_level, issue_date')
        .eq('user_id', userId)

    // Fetch enrollments with full modular hierarchy (modules & lessons)
    const { data: enrollments, error: enrollError } = await dbClient
        .from('enrollments')
        .select(`
            id,
            enrolled_at,
            completed_at,
            progress,
            status,
            courses (
                id,
                title,
                slug,
                level,
                duration_hours,
                course_modules (
                    sort_order,
                    modules (
                        id,
                        title,
                        description,
                        lessons (
                            id,
                            title,
                            slug,
                            duration_minutes,
                            sort_order
                        )
                    )
                )
            )
        `)
        .eq('user_id', userId)

    if (enrollError) {
        console.error("Error fetching transcript enrollments:", enrollError)
        return { error: "Failed to fetch transcript data" }
    }

    // Format course modules cleanly
    const enrollmentsWithModules = (enrollments || []).map(e => {
        const c = e.courses as any;
        if (!c) return e;
        const rawMods = c.course_modules || [];
        const sortedMods = rawMods
            .map((cm: any) => {
                if (!cm.modules) return null;
                return {
                    ...cm.modules,
                    sort_order: cm.sort_order,
                    lessons: (cm.modules.lessons || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                }
            })
            .filter((m: any) => !!m && !!m.title)
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

        return {
            ...e,
            course: {
                ...c,
                modules: sortedMods
            }
        }
    })

    // Fetch all assessment submissions for these enrollments
    const enrollmentIds = (enrollments || []).map(e => e.id)
    let submissions: any[] = []
    if (enrollmentIds.length > 0) {
        const { data: subData, error: subError } = await dbClient
            .from('assessment_submissions')
            .select(`
                enrollment_id,
                score,
                status,
                submitted_at,
                assessment:assessments (
                    title,
                    type,
                    passing_score
                )
            `)
            .in('enrollment_id', enrollmentIds)
            .order('submitted_at', { ascending: false })

        if (subError) console.error("Error fetching transcript submissions:", subError)
        submissions = subData || []
    }

    const studentId = membership?.nic_id || membership?.member_id || `NIC-STU-${userId.substring(0, 8).toUpperCase()}`

    return {
        enrollments: enrollmentsWithModules,
        submissions,
        certificates: certs || [],
        user: {
            full_name: profile?.full_name || "Caregiver Scholar",
            email: profile?.email || fallbackEmail,
            student_id: studentId,
            membership_tier: membership?.membership_tier || "Student Member"
        }
    }
}
