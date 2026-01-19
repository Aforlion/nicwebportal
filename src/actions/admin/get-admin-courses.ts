import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getAdminCourses() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify admin role (optional here, but enforced in middleware/component)
    // const { data: { user } } = await supabase.auth.getUser()

    const { data: courses, error } = await supabase
        .from('courses')
        .select(`
            *,
            _count: enrollments(count)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching admin courses:', error)
        return []
    }

    // Transform count if needed, or just return as is
    return courses.map((course: any) => ({
        ...course,
        enrollmentCount: course._count?.[0]?.count || 0
    }))
}

export async function getAdminCourse(courseId: string) {
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
                    is_preview,
                    duration_minutes,
                    sort_order
                )
            )
        `)
        .eq('id', courseId)
        .single()

    if (error) {
        console.error('Error fetching admin course:', error)
        return null
    }

    // Sort modules and lessons
    if (course.modules) {
        course.modules.sort((a: any, b: any) => a.sort_order - b.sort_order)
        course.modules.forEach((module: any) => {
            if (module.lessons) {
                module.lessons.sort((a: any, b: any) => a.sort_order - b.sort_order)
            }
        })
    }

    return course
}
