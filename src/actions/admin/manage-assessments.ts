'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

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

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const passing_score = parseInt(formData.get('passing_score') as string) || 70
    const questionsJson = formData.get('questions') as string

    let questions = []
    try {
        questions = JSON.parse(questionsJson)
    } catch (e) {
        return { error: 'Invalid question data' }
    }

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
                title,
                description,
                passing_score,
                questions,
                updated_at: new Date().toISOString() // Assuming schema has this or auto-updates
            })
            .eq('id', existing.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('assessments')
            .insert({
                lesson_id: lessonId,
                title,
                type: 'quiz', // Default for now
                description,
                passing_score,
                questions
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
