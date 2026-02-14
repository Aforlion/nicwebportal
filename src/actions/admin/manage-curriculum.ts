'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { ModuleSchema, LessonSchema } from "@/lib/validations"
import { adminActionRateLimiter } from "@/lib/rate-limit"

// --- Modules ---

export async function createModule(courseId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

    try {
        const rawData = {
            course_id: courseId,
            title: formData.get('title') as string,
            sort_order: 0, // Placeholder, calculated below
        }

        // Rate Limiting
        const allowed = await adminActionRateLimiter.check(courseId) // Using courseId as a simple partition
        if (!allowed) return { error: 'Too many requests. Please try again later.' }

        const validatedData = ModuleSchema.omit({ sort_order: true }).parse(rawData)
        const { title } = validatedData

        // Get current max sort order
        const { data: existingModules } = await supabase
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
            return { error: 'Failed to create module in database' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        return { error: err.message || 'An unexpected error occurred' }
    }
}

export async function deleteModule(courseId: string, moduleId: string) {
    // Strict Admin Check
    await requireAdmin()

    try {
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
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred while deleting the module' }
    }
}

// --- Lessons ---

export async function createLesson(courseId: string, moduleId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

    try {
        const rawData = {
            module_id: moduleId,
            title: formData.get('title') as string,
            duration_minutes: 0, // Default
            sort_order: 0, // Calculated below
        }

        const validatedData = LessonSchema.omit({ sort_order: true }).partial({ duration_minutes: true }).parse(rawData)
        const { title } = validatedData

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
                title,
                slug,
                content: '',
                sort_order: nextOrder,
                is_preview: false,
                duration_minutes: 0
            })

        if (error) {
            console.error('Create lesson error:', error)
            return { error: 'Failed to create lesson in database' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        return { error: err.message || 'An unexpected error occurred' }
    }
}

export async function deleteLesson(courseId: string, lessonId: string) {
    // Strict Admin Check
    await requireAdmin()

    try {
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
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred while deleting the lesson' }
    }
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

    try {
        const rawData = {
            module_id: '00000000-0000-0000-0000-000000000000', // Dummy as we are updating existing
            title: formData.get('title') as string,
            video_url: formData.get('video_url') as string,
            duration_minutes: parseInt(formData.get('duration_minutes') as string) || 0,
            is_preview: formData.get('is_preview') === 'on',
            content: formData.get('content') as string,
        }

        const validatedData = LessonSchema.omit({ module_id: true, sort_order: true }).partial().parse(rawData)

        // Only update fields that are present, or just update all
        const updates = {
            ...validatedData,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('lessons')
            .update(updates)
            .eq('id', lessonId)

        if (error) {
            console.error('Update lesson error:', error)
            return { error: 'Database update failed' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        return { error: err.message || 'An unexpected error occurred' }
    }
}
