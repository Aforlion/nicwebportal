import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getAdminCourses() {
    try {
        await requireAdmin()

        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data: courses, error } = await supabase
            .from('courses')
            .select(`
                *,
                _count: enrollments(count)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching admin courses:', error)
            return { error: 'Failed to fetch admin courses' }
        }

        // Transform count if needed
        const transformedCourses = courses.map((course: any) => ({
            ...course,
            enrollmentCount: course._count?.[0]?.count || 0
        }))

        return { courses: transformedCourses }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}

export async function getAdminCourse(courseId: string) {
    try {
        await requireAdmin()

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
    } catch (err: any) {
        console.error('getAdminCourse authorization error:', err)
        return null
    }
}
