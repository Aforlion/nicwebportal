'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { updateCourseProgress } from "./progress"
import { AnswersSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendAssessmentReceiptEmail } from "@/lib/email"

export async function submitAssessment(courseId: string, lessonId: string, assessmentId: string, answers: unknown) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authorized. Please log in." }
    }

    // Rate limit: max 3 assessment submissions per minute per user per assessment
    const allowed = await checkRateLimit('assessment', `submit-assessment:${user.id}:${assessmentId}`)
    if (!allowed) return { error: 'Submission rate limit exceeded. Please wait before trying again.' }

    // 1. Validate and sanitize answers BEFORE any processing or storage
    const parsedAnswers = AnswersSchema.safeParse(answers)
    if (!parsedAnswers.success) {
        return { error: `Invalid submission format: ${parsedAnswers.error.issues.map(e => e.message).join(', ')}` }
    }
    const safeAnswers = parsedAnswers.data

    // 2. Fetch Assessment to grade
    const { data: assessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

    if (!assessment) {
        return { error: "Assessment not found." }
    }

    // 3. Calculate Score & Determine if Manual Review is needed
    let score = 0
    let autogradableCount = 0
    let requiresManualReview = false

    assessment.questions.forEach((q: any) => {
        const studentAnswer = safeAnswers[q.id]

        if (q.type === 'essay' || q.type === 'report') {
            requiresManualReview = true
        } else {
            autogradableCount += 1
            if (studentAnswer && studentAnswer === q.correctDetails?.answer) {
                score += 1
            }
        }
    })

    const percentage = autogradableCount > 0 ? Math.round((score / autogradableCount) * 100) : 0
    const passed = !requiresManualReview && percentage >= assessment.passing_score
    const status = requiresManualReview ? 'pending_review' : (passed ? 'passed' : 'failed')

    // 4. Get Enrollment ID (also verifies the student is enrolled)
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (!enrollment) return { error: "You are not enrolled in this course." }

    // 5. Save Submission — using validated safeAnswers only
    const { data: subData, error: subError } = await supabase
        .from('assessment_submissions')
        .insert({
            assessment_id: assessmentId,
            enrollment_id: enrollment.id,
            score: requiresManualReview ? null : percentage,
            status: status,
            submission_data: safeAnswers,   // Zod-validated, sanitized payload
            submitted_at: new Date().toISOString(),
            graded_at: requiresManualReview ? null : new Date().toISOString()
        })
        .select('id')
        .single()

    if (subError || !subData) {
        console.error('[submitAssessment] DB insert error:', subError)
        return { error: 'Something went wrong saving your submission. Please try again.' }
    }

    const submissionId = subData.id

    // 6. Trigger AI grading if needed, or handle autogradable results
    let aiPassed = false
    let aiScore = 0
    let aiFeedback = ""

    if (requiresManualReview) {
        // Trigger AI Auto-Grading (imported at top)
        const { autoGradeSubmission } = await import("./ai-grading")
        const aiResult = await autoGradeSubmission(submissionId)
        if (aiResult.success) {
            aiPassed = aiResult.passed!
            aiScore = aiResult.score!
            aiFeedback = aiResult.feedback!
        }
    }

    // 7. Update Lesson Progress to allow unblocked progression to the next lesson
    await supabase
        .from('lesson_progress')
        .upsert({
            enrollment_id: enrollment.id,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
        }, { onConflict: 'enrollment_id, lesson_id' })

    await updateCourseProgress(enrollment.id, user.id)
    revalidatePath(`/portal/student/courses/${courseId}`)

    const isPassing = passed || aiPassed
    const finalScore = requiresManualReview ? aiScore : percentage

    // Send immediate email for autograded assessments (non-manual review or AI completed)
    if (!requiresManualReview && user.email) {
        try {
            const { sendAssessmentResultEmail } = await import("@/lib/email")
            const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
            const { data: crs } = await supabase.from('courses').select('title').eq('id', courseId).single()
            await sendAssessmentResultEmail(
                user.email,
                profile?.full_name || "Student",
                crs?.title || "Caregiver Training",
                assessment.title || "Assessment",
                isPassing,
                finalScore,
                assessment.passing_score || 70,
                isPassing ? "Congratulations on passing!" : "You can retake this assessment anytime to reach the passing mark.",
                courseId
            )
        } catch (emailErr) {
            console.error("[submitAssessment] Email error:", emailErr)
        }
    }

    return {
        success: true,
        score: finalScore,
        passingScore: assessment.passing_score,
        passed: isPassing,
        pending: requiresManualReview && !aiPassed && aiScore === 0,
        feedback: requiresManualReview 
            ? (aiFeedback || "Assessment submitted successfully, pending review.")
            : (isPassing ? (aiFeedback || "Great job! You passed.") : (aiFeedback || "You didn't reach the passing score. You can try again anytime."))
    }
}

