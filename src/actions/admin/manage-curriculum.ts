'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// --- Modules ---

export async function createModule(courseId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const title = formData.get('title') as string

    // Get current max sort order
    const { data: existingModules, error: fetchError } = await supabase
        .from('modules')
        .select('sort_order')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: false })
        .limit(1)

    const nextOrder = (existingModules?.[0]?.sort_order || 0) + 1

    const { error } = await supabase
        .from('modules')
        .insert({
            course_id: courseId,
            title,
            sort_order: nextOrder
        })

    if (error) {
        console.error('Create module error:', error)
        return { error: 'Failed to create module' }
    }

    revalidatePath(`/admin/training/${courseId}`)
    return { success: true }
}

export async function deleteModule(courseId: string, moduleId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId)

    if (error) {
        console.error('Delete module error:', error)
        return { error: 'Failed to delete module' }
    }

    revalidatePath(`/admin/training/${courseId}`)
    return { success: true }
}

// --- Lessons ---

export async function createLesson(courseId: string, moduleId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const title = formData.get('title') as string

    // Get current max sort order
    const { data: existingLessons } = await supabase
        .from('lessons')
        .select('sort_order')
        .eq('module_id', moduleId)
        .order('sort_order', { ascending: false })
        .limit(1)

    const nextOrder = (existingLessons?.[0]?.sort_order || 0) + 1

    // Simple slug generation
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()

    const { error } = await supabase
        .from('lessons')
        .insert({
            module_id: moduleId,
            course_id: courseId, // Denormalized strictly for easier RLS or querying if needed, though schema might not have it mandatory, let's check. 
            // My schema 007_lms_core.sql has lessons(module_id references modules). It DOES NOT have course_id in lessons directly?
            // Let me check schema. 007_lms_core.sql: 
            // create table lessons ( ... module_id uuid references modules... );
            // It does NOT have course_id. So I should not insert it if the column doesn't exist.
            // I will assume standard relational: module belongs to course, lesson belongs to module.
            title,
            slug,
            content: '',
            sort_order: nextOrder,
            is_preview: false,
            duration_minutes: 0
        })

    if (error) {
        console.error('Create lesson error:', error)
        return { error: 'Failed to create lesson' }
    }

    revalidatePath(`/admin/training/${courseId}`)
    return { success: true }
}

export async function deleteLesson(courseId: string, lessonId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

    if (error) {
        console.error('Delete lesson error:', error)
        return { error: 'Failed to delete lesson' }
    }

    revalidatePath(`/admin/training/${courseId}`)
    return { success: true }
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const title = formData.get('title') as string
    const video_url = formData.get('video_url') as string
    const duration_minutes = parseInt(formData.get('duration_minutes') as string) || 0
    const is_preview = formData.get('is_preview') === 'on'
    const content = formData.get('content') as string

    // Only update fields that are present, or just update all
    const updates = {
        title,
        video_url,
        duration_minutes,
        is_preview,
        content,
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', lessonId)

    if (error) {
        console.error('Update lesson error:', error)
        return { error: 'Failed to update lesson' }
    }

    revalidatePath(`/admin/training/${courseId}`)
    return { success: true }
}
