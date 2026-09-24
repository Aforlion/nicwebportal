'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { gradeWithGemini } from "@/lib/ai/gemini"
import { updateCourseProgress } from "./progress"

/**
 * Server action to grade a specific submission using AI.
 * This can be called automatically upon student submission or manually by an admin.
 */
export async function autoGradeSubmission(submissionId: string) {
    const { supabaseAdmin } = await import("@/lib/supabase/admin")
    const supabase = supabaseAdmin

    try {
        // 1. Fetch submission with assessment details, enrollment, and profile
        const { data: submission, error: subError } = await supabase
            .from('assessment_submissions')
            .select(`
                *,
                enrollment:enrollments(
                    user_id,
                    course_id,
                    course:courses(title),
                    profile:profiles(email, full_name)
                ),
                assessment:assessments(
                    id,
                    title,
                    questions,
                    grading_rubric,
                    passing_score
                )
            `)
            .eq('id', submissionId)
            .single()

        if (subError || !submission) {
            console.error("Error fetching submission for AI grading:", subError)
            return { success: false, error: "Submission not found" }
        }

        const assessment = submission.assessment as any
        const studentAnswers = submission.submission_data as any
        const enrollment = submission.enrollment as any

        // 2. Prepare the payload for Gemini
        // We aggregate all essay/report questions into one grading session for efficiency
        // or grade individually. For NIC, usually one assessment has several related questions.
        
        // Find essay questions
        const essayQuestions = assessment.questions.filter((q: any) => q.type === 'essay' || q.type === 'report')
        
        if (essayQuestions.length === 0) {
            return { success: true, message: "No questions requiring AI review." }
        }

        // Combine questions and answers for the AI
        const scoringTasks = essayQuestions.map((q: any) => {
            const answer = studentAnswers[q.id] || "No answer provided."
            return `Question: ${q.text}\nStudent Answer: ${answer}`
        }).join('\n\n---\n\n')

        // 3. Call Gemini
        const result = await gradeWithGemini(
            scoringTasks,
            "See questions above", 
            assessment.grading_rubric || "Evaluate based on professional caregiver standards, empathy, and safety."
        )

        // 4. Update the submission in the DB
        const passed = result.score >= assessment.passing_score
        const { error: updateError } = await supabase
            .from('assessment_submissions')
            .update({
                score: result.score,
                status: passed ? 'passed' : 'failed',
                feedback: result.feedback,
                graded_by_ai: true,
                graded_at: new Date().toISOString()
            })
            .eq('id', submissionId)

        if (updateError) throw updateError

        // 5. Update Course Progress
        await updateCourseProgress(submission.enrollment_id, enrollment?.user_id)

        // 6. Send Result Email Notification
        if (enrollment?.profile?.email) {
            try {
                const { sendAssessmentResultEmail } = await import("@/lib/email")
                await sendAssessmentResultEmail(
                    enrollment.profile.email,
                    enrollment.profile.full_name || "Student",
                    enrollment.course?.title || "Caregiver Training",
                    assessment.title || "Assessment",
                    passed,
                    result.score,
                    assessment.passing_score || 70,
                    result.feedback || "",
                    enrollment.course_id
                )
            } catch (emailErr) {
                console.error("[autoGradeSubmission] Failed sending result email:", emailErr)
            }
        }

        return { 
            success: true, 
            score: result.score, 
            passed, 
            feedback: result.feedback 
        }

    } catch (error: any) {
        console.error("AI Auto-Grading failed:", error)
        return { success: false, error: error.message || "AI Grading service currently unavailable" }
    }
}
