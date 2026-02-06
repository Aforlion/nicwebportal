'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { CourseSchema } from "@/lib/validations"

export async function createCourse(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

    // Validate Input
    const rawData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        level: formData.get('level') as string,
        duration_hours: parseInt(formData.get('duration_hours') as string) || 0,
        is_published: formData.get('is_published') === 'true',
    }

    const validatedData = CourseSchema.parse(rawData)
    const { title, description, price, level, duration_hours, is_published } = validatedData

    // Generate slug from title
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    const { data, error } = await supabase
        .from('courses')
        .insert({
            ...validatedData,
            instructor_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

    if (error) {
        console.error('Create course error:', error)
        return { error: 'Failed to create course' }
    }

    revalidatePath('/admin/training')
    revalidatePath('/programs')

    return { success: true, courseId: data.id }
}

export async function updateCourse(courseId: string, formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Strict Admin Check
    await requireAdmin()

    // Validate Input (Partial for update)
    const rawData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        level: formData.get('level') as string,
        duration_hours: parseInt(formData.get('duration_hours') as string) || 0,
        is_published: formData.get('is_published') === 'true',
    }

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
        return { error: 'Failed to update course' }
    }

    revalidatePath('/admin/training')
    revalidatePath(`/admin/training/${courseId}`)
    revalidatePath('/programs')

    return { success: true }
}
