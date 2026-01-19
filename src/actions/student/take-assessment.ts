'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

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

    // 2. Calculate Score
    let score = 0
    let maxScore = assessment.questions.length // Assuming 1 point per question for MVP
    // Or if max_score is in table, usage depends. Let's assume equal weight for now.

    // Simple grading logic for "multiple_choice" or "true_false"
    // questions structure: [{ id, correctDetails: { answer: "optionId" } }]
    // answers structure: { questionId: "selectedOptionId" }

    assessment.questions.forEach((q: any) => {
        const studentAnswer = answers[q.id]
        // Check if correct
        if (studentAnswer && studentAnswer === q.correctDetails?.answer) {
            score += 1
        }
    })

    const percentage = Math.round((score / maxScore) * 100)
    const passed = percentage >= assessment.passing_score
    const status = passed ? 'passed' : 'failed'

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
            score: percentage,
            status: status, // Schema says 'submitted', 'graded'. Let's use 'graded' if auto? 
            // My schema comment says "submitted, graded, pending_review".
            // For auto-graded quiz, it's effectively 'graded'.
            submission_data: answers,
            submitted_at: new Date().toISOString(),
            graded_at: new Date().toISOString()
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

        // Recalculate Course Progress? 
        // We can do a quick calc or trigger. For MVP, we might leave it or do simple calc.
        // Let's do a quick count
        /*
        const { count: completedCount } = await supabase.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('enrollment_id', enrollment.id).eq('is_completed', true)
        const { count: totalLessons } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', courseId) // Need join usually
        // ... Logic for progress update ...
        */

        revalidatePath(`/portal/student/courses/${courseId}`)
    }

    return {
        success: true,
        score: percentage,
        passed,
        feedback: passed ? "Great job! You passed." : "You didn't reach the passing score. Please try again."
    }
}
