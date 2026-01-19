'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getPublishedCourses() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }

    return courses
}

export async function getCourseBySlug(slug: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: course, error } = await supabase
        .from('courses')
        .select(`
            *,
            modules (
                id,
                title,
                sort_order,
                lessons (
                    id,
                    title,
                    slug,
                    duration_minutes,
                    is_preview
                )
            )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (error) {
        console.error('Error fetching course:', error)
        return null
    }

    return course
}
