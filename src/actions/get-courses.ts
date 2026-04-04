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
        .order('sort_order', { ascending: true })

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }

    return courses
}

import { createServerClient } from "@supabase/ssr"

export async function getCourseBySlug(slug: string) {
    const cookieStore = await cookies()
    // Use service role key to bypass RLS for curriculum fetching,
    // as public users need to see the syllabus but RLS on modules blocks anon.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => { },
            }
        }
    )

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
                        content,
                        video_url,
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
