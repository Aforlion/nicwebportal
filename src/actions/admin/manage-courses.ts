'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { CourseSchema } from "@/lib/validations"
import { adminActionRateLimiter } from "@/lib/rate-limit"

export async function createCourse(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

    try {
        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string) || 0,
            level: formData.get('level') as string,
            duration_hours: parseInt(formData.get('duration_hours') as string) || 0,
            is_published: formData.get('is_published') === 'true',
            thumbnail_url: formData.get('thumbnail_url') as string || '',
        }

        // Rate Limiting
        const allowed = await adminActionRateLimiter.check('create-course')
        if (!allowed) return { error: 'Too many requests. Please try again later.' }

        const validatedData = CourseSchema.parse(rawData)
        const { title } = validatedData

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('courses')
            .insert({
                ...validatedData,
                slug,
                created_by: user?.id
            })
            .select()
            .single()

        if (error) {
            console.error('Create course error:', error)
            return { error: 'Failed to create course in database' }
        }

        revalidatePath('/admin/training')
        revalidatePath('/programs')

        return { success: true, courseId: data.id }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        return { error: err.message || 'An unexpected error occurred' }
    }
}

export async function updateCourse(courseId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

    try {
        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string) || 0,
            level: formData.get('level') as string,
            duration_hours: parseInt(formData.get('duration_hours') as string) || 0,
            is_published: formData.get('is_published') === 'true',
        }

        // Rate Limiting
        const allowed = await adminActionRateLimiter.check(`update-course-${courseId}`)
        if (!allowed) return { error: 'Too many requests. Please try again later.' }

        const validatedData = CourseSchema.partial().parse(rawData)
        const thumbnail_url = formData.get('thumbnail_url') as string

        const updates: any = {
            ...validatedData,
            updated_at: new Date().toISOString()
        }

        if (thumbnail_url) updates.thumbnail_url = thumbnail_url

        const { error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId)

        if (error) {
            console.error('Update course error:', error)
            return { error: 'Database update failed' }
        }

        revalidatePath('/admin/training')
        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs')

        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        return { error: err.message || 'An unexpected error occurred' }
    }
}
