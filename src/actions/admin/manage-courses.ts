'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { CourseSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"

export async function createCourse(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    const profile = await requireAdmin()

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

        // Rate Limiting: key is action + user ID (no cross-user interference)
        const allowed = await checkRateLimit('admin', `create-course:${profile.id}`)
        if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

        const validatedData = CourseSchema.parse(rawData)
        const { title } = validatedData

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

        const { data, error } = await supabase
            .from('courses')
            .insert({
                ...validatedData,
                slug,
                created_by: profile.id
            })
            .select()
            .single()

        if (error) {
            console.error('[createCourse] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath('/admin/training')
        revalidatePath('/programs')

        return { success: true, courseId: data.id }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        console.error('[createCourse] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}

export async function updateCourse(courseId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    const profile = await requireAdmin()

    try {
        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string) || 0,
            level: formData.get('level') as string,
            duration_hours: parseInt(formData.get('duration_hours') as string) || 0,
            is_published: formData.get('is_published') === 'true',
        }

        // Rate Limiting: key is action + user ID
        const allowed = await checkRateLimit('admin', `update-course:${profile.id}:${courseId}`)
        if (!allowed) return { error: 'Too many requests. Please try again in a minute.' }

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
            console.error('[updateCourse] DB error:', error)
            return { error: 'Something went wrong. Please try again.' }
        }

        revalidatePath('/admin/training')
        revalidatePath(`/admin/training/${courseId}`)
        revalidatePath('/programs')

        return { success: true }
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: `Validation failed: ${err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
        }
        console.error('[updateCourse] Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}
