'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { ModuleSchema, LessonSchema } from "@/lib/validations"

// --- Modules ---

export async function createModule(courseId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const user = (await supabase.auth.getUser()).data.user

    await requireAdmin()

    try {
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const completion_requirements = formData.get('completion_requirements') as string

        const validatedData = ModuleSchema.omit({ course_id: true, sort_order: true }).parse({
            title,
            description,
            completion_requirements
        })

        // 1. Create the standalone module
        const { data: moduleData, error: moduleError } = await supabase
            .from('modules')
            .insert({
                title: validatedData.title,
                description: validatedData.description,
                completion_requirements: validatedData.completion_requirements,
                created_by: user?.id
            })
            .select()
            .single()

        if (moduleError) throw moduleError

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
            .insert({
                course_id: courseId,
                module_id: moduleData.id,
                sort_order: nextOrder
            })

        if (linkError) throw linkError

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
                created_by: user?.id
            })
        }

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Create module error:', err)
        return { error: err.message || 'Failed to create module' }
    }
}

export async function updateModule(courseId: string, moduleId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const profile = await requireAdmin()

    try {
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const completion_requirements = formData.get('completion_requirements') as string

        // Permission Check: Admin can edit all, Instructor only their own
        if (profile.role === 'instructor') {
            const { data: module } = await supabase.from('modules').select('created_by').eq('id', moduleId).single()
            if (module?.created_by !== profile.id) {
                return { error: "Permission denied. You can only edit your own modules." }
            }
        }

        const validatedData = ModuleSchema.omit({ course_id: true, sort_order: true }).parse({
            title,
            description,
            completion_requirements
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

        if (error) throw error

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Update module error:', err)
        return { error: err.message || 'Failed to update module' }
    }
}

export async function removeModuleFromCourse(courseId: string, moduleId: string) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { error } = await supabase
            .from('course_modules')
            .delete()
            .eq('course_id', courseId)
            .eq('module_id', moduleId)

        if (error) throw error

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Remove module error:', err)
        return { error: 'Failed to remove module from course' }
    }
}

export async function deleteModule(moduleId: string) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { error } = await supabase
            .from('modules')
            .delete()
            .eq('id', moduleId)

        if (error) throw error

        revalidatePath(`/admin/training`)
        return { success: true }
    } catch (err: any) {
        console.error('Delete module error:', err)
        return { error: err.message || 'Failed to delete module' }
    }
}

export async function linkModuleToCourse(courseId: string, moduleId: string) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Check if already linked
        const { data: existing } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', courseId)
            .eq('module_id', moduleId)
            .single()

        if (existing) {
            return { error: 'Module is already linked to this course' }
        }

        // Get sort order
        const { data: existingLinks } = await supabase
            .from('course_modules')
            .select('sort_order')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: false })
            .limit(1)

        const nextOrder = (existingLinks?.[0]?.sort_order || 0) + 1

        const { error } = await supabase
            .from('course_modules')
            .insert({
                course_id: courseId,
                module_id: moduleId,
                sort_order: nextOrder
            })

        if (error) throw error

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Link module error:', err)
        return { error: 'Failed to link module to course' }
    }
}

// --- Lessons ---

export async function createLesson(courseId: string, moduleId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    await requireAdmin()

    try {
        const title = formData.get('title') as string

        // Get current max sort order (excluding the default end lessons Summary=98, Assessment=99)
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
                created_by: (await supabase.auth.getUser()).data.user?.id
            })

        if (error) throw error

        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error('Create lesson error:', err)
        return { error: err.message || 'Failed to create lesson' }
    }
}

export async function deleteLesson(courseId: string, lessonId: string) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId)

        if (error) throw error

        revalidatePath(`/admin/training/${courseId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Delete lesson error:', err)
        return { error: 'Failed to delete lesson' }
    }
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    await requireAdmin()

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

        if (error) throw error

        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error('Update lesson error:', err)
        return { error: err.message || 'Failed to update lesson' }
    }
}

export async function updateLessonOrder(courseId: string, moduleId: string, lessonIds: string[]) {
    await requireAdmin()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    try {
        for (let i = 0; i < lessonIds.length; i++) {
            const { error } = await supabase
                .from('lessons')
                .update({ sort_order: i + 1 })
                .eq('id', lessonIds[i])
                .eq('module_id', moduleId)

            if (error) throw error
        }

        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error('Update lesson order error:', err)
        return { error: 'Failed to update lesson order' }
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

        if (error) throw error
        return { modules: data }
    } catch (err: any) {
        console.error('Fetch modules error:', err)
        return { error: 'Failed to fetch available modules' }
    }
}
