'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCourse(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Auth check should be done via middleware/utils, but good to have here too
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const level = formData.get('level') as string
    const duration_hours = parseInt(formData.get('duration_hours') as string) || 0
    const is_published = formData.get('is_published') === 'true'

    // Generate slug from title
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    const { data, error } = await supabase
        .from('courses')
        .insert({
            title,
            slug,
            description,
            price,
            level,
            duration_hours,
            is_published,
            instructor_id: user.id // Assuming the creator is the instructor for now
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

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const level = formData.get('level') as string
    const duration_hours = parseInt(formData.get('duration_hours') as string) || 0
    const is_published = formData.get('is_published') === 'on'
    const thumbnail_url = formData.get('thumbnail_url') as string // Handled via client upload separately usually

    const updates: any = {
        title,
        description,
        price,
        level,
        duration_hours,
        is_published,
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
