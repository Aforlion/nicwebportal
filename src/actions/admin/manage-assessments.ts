'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { updateCourseProgress } from "../student/progress"
import { requireAdmin } from "@/lib/auth"
import { AssessmentSchema } from "@/lib/validations"
import { adminActionRateLimiter } from "@/lib/rate-limit"

export async function getAssessment(lessonId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('lesson_id', lessonId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching assessment:', error)
    }

    return data
}

export async function saveAssessment(lessonId: string, formData: FormData) {
    // Strict Admin Check
    await requireAdmin()

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const profile = await requireAdmin()
        const user = (await supabase.auth.getUser()).data.user

        // Rate Limiting
        const allowed = await adminActionRateLimiter.check(`save-assessment-${lessonId}`)
        if (!allowed) return { error: 'Too many requests. Please try again later.' }

        // Validate Input
        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            passing_score: parseInt(formData.get('passing_score') as string) || 70,
            questions: JSON.parse(formData.get('questions') as string || '[]'),
        }

        const validatedData = AssessmentSchema.parse(rawData)
        const { title, description, passing_score, questions } = validatedData

        // Check if assessment exists
        const { data: existing } = await supabase
            .from('assessments')
            .select('id')
            .eq('lesson_id', lessonId)
            .single()

        let dbError;

        if (existing) {
            const { error: updateError } = await supabase
                .from('assessments')
                .update({
                    ...validatedData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
            dbError = updateError
        } else {
            const { error: insertError } = await supabase
                .from('assessments')
                .insert({
                    lesson_id: lessonId,
                    ...validatedData,
                    type: 'quiz',
                    created_by: user?.id
                })
            dbError = insertError
        }

        if (dbError) {
            console.error('Save assessment error:', dbError)
            return { error: `Database error: ${dbError.message}` }
        }

        revalidatePath(`/admin/training`)
        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        return { error: err.message || 'An unexpected error occurred while saving the assessment' }
    }
}
export async function getSubmissions(status?: string) {
    await requireAdmin()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    let query = supabase
        .from('assessment_submissions')
        .select(`
            *,
            assessment:assessments(
                title,
                lessons(
                    modules(
                        courses(title)
                    )
                )
            ),
            enrollment:enrollments(
                profiles(full_name, avatar_url)
            )
        `)
        .order('submitted_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching submissions:', error)
        return { error: 'Failed to fetch submissions' }
    }

    return { submissions: data }
}

export async function gradeSubmission(submissionId: string, score: number, feedback: string) {
    await requireAdmin()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const admin = (await supabase.auth.getUser()).data.user

    try {
        // Fetch basic info for progress update
        const { data: submission } = await supabase
            .from('assessment_submissions')
            .select('enrollment_id, assessment_id')
            .eq('id', submissionId)
            .single()

        if (submission) {
            const { data: assessment } = await supabase
                .from('assessments')
                .select('lesson_id, passing_score')
                .eq('id', submission.assessment_id)
                .single()

            if (assessment && score >= assessment.passing_score) {
                // Update lesson progress
                await supabase
                    .from('lesson_progress')
                    .upsert({
                        enrollment_id: submission.enrollment_id,
                        lesson_id: assessment.lesson_id,
                        is_completed: true,
                        completed_at: new Date().toISOString(),
                        last_accessed_at: new Date().toISOString()
                    }, { onConflict: 'enrollment_id, lesson_id' })
                await updateCourseProgress(submission.enrollment_id)
            }
        }

        revalidatePath('/admin/assessments')
        revalidatePath('/portal/student/courses')
        return { success: true }
    } catch (err: any) {
        console.error('Grade submission error:', err)
        return { error: err.message || 'Failed to grade submission' }
    }
}
