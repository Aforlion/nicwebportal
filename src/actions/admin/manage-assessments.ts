'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { AssessmentSchema } from "@/lib/validations"

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
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

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

    let error;

    if (existing) {
        const { error: updateError } = await supabase
            .from('assessments')
            .update({
                ...validatedData,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('assessments')
            .insert({
                lesson_id: lessonId,
                ...validatedData,
                type: 'quiz'
            })
        error = insertError
    }

    if (error) {
        console.error('Save assessment error:', error)
        return { error: 'Failed to save assessment' }
    }

    revalidatePath(`/admin/training`) // Specific path might need courseId, but this is okay
    return { success: true }
}
