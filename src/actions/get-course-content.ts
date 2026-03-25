import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getCourseContent(courseId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // verify enrollment
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (!enrollment) return null

    // fetch full course content via modular relationship
    const { data: course, error } = await supabase
        .from('courses')
        .select(`
            id,
            title,
            description,
            course_modules (
                sort_order,
                modules (
                    id,
                    title,
                    description,
                    lessons (
                        id,
                        title,
                        slug,
                        video_url,
                        resource_url,
                        content,
                        duration_minutes,
                        sort_order,
                        assessments (
                            id,
                            title,
                            description,
                            passing_score,
                            questions
                        )
                    )
                )
            )
        `)
        .eq('id', courseId)
        .single()

    if (error || !course) {
        console.error('Error fetching course content:', error)
        return null
    }

    const courseWithModules = {
        ...course,
        modules: (course.course_modules as any[])
            ?.map(cm => ({
                ...cm.modules,
                lessons: cm.modules.lessons.map((l: any) => ({
                    ...l,
                    assessments: l.assessments?.[0] || null // Flatten assessments array to single object
                })),
                sort_order: cm.sort_order
            }))
            .filter(m => !!m)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || []
    }

    // fetch progress map
    const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id, is_completed')
        .eq('enrollment_id', enrollment.id)

    // transform progress into a map: { lessonId: true }
    const progressMap = (progressData || []).reduce((acc: any, curr: any) => {
        acc[curr.lesson_id] = curr.is_completed
        return acc
    }, {})

    return {
        course: courseWithModules,
        enrollmentId: enrollment.id,
        progress: progressMap,
        overallProgress: enrollment.progress
    }
}
