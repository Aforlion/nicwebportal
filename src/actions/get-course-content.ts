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

    // fetch full course content
    const { data: course, error } = await supabase
        .from('courses')
        .select(`
            id,
            title,
            modules (
                id,
                title,
                sort_order,
                lessons (
                    id,
                    title,
                    slug,
                    video_url,
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
        `)
        .eq('id', courseId)
        .single()

    if (error) {
        console.error('Error fetching course content:', error)
        return null
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
        course,
        enrollmentId: enrollment.id,
        progress: progressMap,
        overallProgress: enrollment.progress
    }
}
