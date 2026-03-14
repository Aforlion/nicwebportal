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
            course_modules (
                sort_order,
                module:modules (
                    id,
                    title,
                    description,
                    lessons (
                        id,
                        title,
                        slug,
                        duration_minutes,
                        is_preview,
                        sort_order
                    )
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

    // Flatten modular structure
    if (course.course_modules) {
        course.modules = course.course_modules
            .filter((cm: any) => cm.module)
            .map((cm: any) => ({
                ...cm.module,
                sort_order: cm.sort_order,
                lessons: [...(cm.module.lessons || [])].sort((a: any, b: any) => Number(a.sort_order) - Number(b.sort_order))
            }))
            .sort((a: any, b: any) => Number(a.sort_order) - Number(b.sort_order))
    }

    return course
}
