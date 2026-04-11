'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
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

    // 5. Issue Certificate with Level info
    const { error: insertError } = await supabase
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
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Fetch certificate with student and program details
    const { data: cert, error } = await supabase
        .from('certificates')
        .select(`
            *,
            profiles:user_id (
                full_name,
                email
            ),
            programs:program_id (
                title
            )
        `)
        .eq('certificate_number', code)
        .single()

    if (error || !cert) {
        return null
    }

    return cert
}

export async function getStudentCertificates() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    const { data, error } = await supabase
        .from('certificates')
        .select(`
            *,
            programs (title)
        `)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error fetching certificates:", error)
        return { error: "Failed to fetch certificates" }
    }

    return { certificates: data }
}

export async function getStudentTranscript() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    // Fetch enrollments with course titles and overall progress
    const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
            id,
            enrolled_at,
            completed_at,
            progress,
            status,
            courses (
                title,
                duration_hours
            )
        `)
        .eq('user_id', user.id)

    if (enrollError) {
        console.error("Error fetching transcript enrollments:", enrollError)
        return { error: "Failed to fetch transcript data" }
    }

    // Fetch all assessment submissions for these enrollments to show grades
    const enrollmentIds = enrollments.map(e => e.id)
    const { data: submissions, error: subError } = await supabase
        .from('assessment_submissions')
        .select(`
            enrollment_id,
            score,
            status,
            submitted_at,
            assessment:assessments (title)
        `)
        .in('enrollment_id', enrollmentIds)

    if (subError) {
        console.error("Error fetching transcript submissions:", subError)
    }

    return {
        enrollments,
        submissions: submissions || [],
        user: {
            full_name: user.user_metadata?.full_name || "Student",
            email: user.email
        }
    }
}
