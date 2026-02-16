'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { updateCourseProgress } from "./progress"

export async function submitAssessment(courseId: string, lessonId: string, assessmentId: string, answers: any) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated" }
    }

    // 1. Fetch Assessment to grade
    const { data: assessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

    if (!assessment) {
        return { error: "Assessment not found" }
    }

    // 2. Calculate Score & Determine if Manual Review is needed
    let score = 0
    let autogradableCount = 0
    let requiresManualReview = false

    assessment.questions.forEach((q: any) => {
        const studentAnswer = answers[q.id]

        if (q.type === 'essay' || q.type === 'report') {
            requiresManualReview = true
        } else {
            autogradableCount += 1
            // Check if correct (MCQ or True/False)
            if (studentAnswer && studentAnswer === q.correctDetails?.answer) {
                score += 1
            }
        }
    })

    const percentage = autogradableCount > 0 ? Math.round((score / autogradableCount) * 100) : 0
    const passed = !requiresManualReview && percentage >= assessment.passing_score
    const status = requiresManualReview ? 'pending_review' : (passed ? 'passed' : 'failed')

    // 3. Get Enrollment ID
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (!enrollment) return { error: "Not enrolled" }

    // 4. Save Submission
    const { error: subError } = await supabase
        .from('assessment_submissions')
        .insert({
            assessment_id: assessmentId,
            enrollment_id: enrollment.id,
            score: requiresManualReview ? null : percentage,
            status: status,
            submission_data: answers,
            submitted_at: new Date().toISOString(),
            graded_at: requiresManualReview ? null : new Date().toISOString()
        })

    if (subError) {
        console.error('Submission error:', subError)
        return { error: 'Failed to save submission' }
    }

    // 5. Update Lesson Progress if Passed
    if (passed) {
        await supabase
            .from('lesson_progress')
            .upsert({
                enrollment_id: enrollment.id,
                lesson_id: lessonId,
                is_completed: true,
                completed_at: new Date().toISOString(),
                last_accessed_at: new Date().toISOString()
            }, { onConflict: 'enrollment_id, lesson_id' })


        // Trigger Overall Progress Update
        await updateCourseProgress(enrollment.id)

        revalidatePath(`/portal/student/courses/${courseId}`)
    }

    return {
        success: true,
        score: percentage,
        passed,
        feedback: passed ? "Great job! You passed." : "You didn't reach the passing score. Please try again."
    }
}
