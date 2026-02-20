'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { ModuleSchema, LessonSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"

// --- Modules ---

export async function createModule(courseId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `create-module:${profile.id}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        const validatedData = ModuleSchema.omit({ course_id: true, sort_order: true }).parse({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            completion_requirements: formData.get('completion_requirements') as string,
        })

        // 1. Create the standalone module
        const { data: moduleData, error: moduleError } = await supabase
            .from('modules')
            .insert({
                title: validatedData.title,
                description: validatedData.description,
                completion_requirements: validatedData.completion_requirements,
                created_by: profile.id
            })
            .select()
            .single()

        if (moduleError) {
            console.error('[createModule] DB insert error:', moduleError)
            return { error: 'Something went wrong. Please try again.' }
        }

        // 2. Link it to the course
        const { data: existingLinks } = await supabase
            .from('course_modules')
            .select('sort_order')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: false })
            .limit(1)

        const nextOrder = (existingLinks?.[0]?.sort_order || 0) + 1

        const { error: linkError } = await supabase
            .from('course_modules')
            .insert({ course_id: courseId, module_id: moduleData.id, sort_order: nextOrder })

        if (linkError) {
            console.error('[createModule] DB link error:', linkError)
            return { error: 'Something went wrong. Please try again.' }
        }

        // 3. Add Default Lessons: Introduction, Summary, Assessment
        const defaultLessons = [
            { title: "MODULE INTRODUCTION", sort_order: 1 },
            { title: "MODULE SUMMARY & WRAP-UP", sort_order: 98 },
            { title: "MODULE ASSESSMENT", sort_order: 99 }
        ]

        for (const lesson of defaultLessons) {
            const slug = `${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            await supabase.from('lessons').insert({
                module_id: moduleData.id,
                title: lesson.title,
                slug,
                content: `Complete this ${lesson.title.toLowerCase()} to proceed.`,
                sort_order: lesson.sort_order,
                created_by: profile.id
            })
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        console.error('[createModule] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function updateModule(courseId: string, moduleId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `update-module:${profile.id}:${moduleId}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        // Permission Check: Admin can edit all, Instructor only their own
        if (profile.role === 'instructor') {
            const { data: module } = await supabase.from('modules').select('created_by').eq('id', moduleId).single()
            if (module?.created_by !== profile.id) {
                return { error: "Permission denied. You can only edit your own modules." }
            }
        }

        const validatedData = ModuleSchema.omit({ course_id: true, sort_order: true }).parse({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            completion_requirements: formData.get('completion_requirements') as string,
        })

        const { error } = await supabase
            .from('modules')
            .update({
                title: validatedData.title,
                description: validatedData.description,
                completion_requirements: validatedData.completion_requirements,
                updated_at: new Date().toISOString()
            })
            .eq('id', moduleId)

        if (error) {
            console.error('[updateModule] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        console.error('[updateModule] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function removeModuleFromCourse(courseId: string, moduleId: string) {
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `remove-module:${profile.id}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { error } = await supabase
            .from('course_modules')
            .delete()
            .eq('course_id', courseId)
            .eq('module_id', moduleId)

        if (error) {
            console.error('[removeModuleFromCourse] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('[removeModuleFromCourse] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function deleteModule(moduleId: string) {
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `delete-module:${profile.id}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { error } = await supabase
            .from('modules')
            .delete()
            .eq('id', moduleId)

        if (error) {
            console.error('[deleteModule] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath(`/admin/training`)
        return { success: true }
    } catch (err: any) {
        console.error('[deleteModule] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function linkModuleToCourse(courseId: string, moduleId: string) {
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `link-module:${profile.id}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data: existing } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', courseId)
            .eq('module_id', moduleId)
            .single()

        if (existing) return { error: 'Module is already linked to this course' }

        const { data: existingLinks } = await supabase
            .from('course_modules')
            .select('sort_order')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: false })
            .limit(1)

        const nextOrder = (existingLinks?.[0]?.sort_order || 0) + 1

        const { error } = await supabase
            .from('course_modules')
            .insert({ course_id: courseId, module_id: moduleId, sort_order: nextOrder })

        if (error) {
            console.error('[linkModuleToCourse] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('[linkModuleToCourse] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

// --- Lessons ---

export async function createLesson(courseId: string, moduleId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `create-lesson:${profile.id}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        const title = formData.get('title') as string

        const { data: existingLessons } = await supabase
            .from('lessons')
            .select('sort_order')
            .eq('module_id', moduleId)
            .lt('sort_order', 98)
            .order('sort_order', { ascending: false })
            .limit(1)

        const nextOrder = (existingLessons?.[0]?.sort_order || 0) + 1
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
                duration_minutes: 0,
                created_by: profile.id
            })

        if (error) {
            console.error('[createLesson] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error('[createLesson] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function deleteLesson(courseId: string, lessonId: string) {
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `delete-lesson:${profile.id}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId)

        if (error) {
            console.error('[deleteLesson] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('[deleteLesson] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const profile = await requireAdmin()

    const allowed = await checkRateLimit('admin', `update-lesson:${profile.id}:${lessonId}`)
    if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

    try {
        const updates = {
            title: formData.get('title') as string,
            video_url: formData.get('video_url') as string,
            resource_url: formData.get('resource_url') as string,
            duration_minutes: parseInt(formData.get('duration_minutes') as string) || 0,
            is_preview: formData.get('is_preview') === 'on',
            content: formData.get('content') as string,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('lessons')
            .update(updates)
            .eq('id', lessonId)

        if (error) {
            console.error('[updateLesson] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error('[updateLesson] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function updateLessonOrder(courseId: string, moduleId: string, lessonIds: string[]) {
    const profile = await requireAdmin()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    try {
        for (let i = 0; i < lessonIds.length; i++) {
            const { error } = await supabase
                .from('lessons')
                .update({ sort_order: i + 1 })
                .eq('id', lessonIds[i])
                .eq('module_id', moduleId)

            if (error) {
                console.error('[updateLessonOrder] DB error:', error)
                return { error: 'Something went wrong. Please try again.' }
            }
        }

        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error('[updateLessonOrder] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function getAvailableModules() {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data, error } = await supabase
            .from('modules')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[getAvailableModules] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        return { modules: data }
    } catch (err: any) {
        console.error('[getAvailableModules] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}
