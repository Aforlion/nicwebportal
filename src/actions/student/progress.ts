'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Recalculates the course progress percentage based on completed lessons
 */
export async function updateCourseProgress(enrollmentId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 1. Get Course ID and current state
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('course_id, completed_lessons')
        .eq('id', enrollmentId)
        .single()

    if (!enrollment) return

    // 2. Fetch all modules and lessons for this course
    const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', enrollment.course_id)

    const moduleIds = modules?.map(m => m.id) || []

    if (moduleIds.length === 0) return

    const { data: allLessons } = await supabase
        .from('lessons')
        .select('id')
        .in('module_id', moduleIds)

    const totalLessons = allLessons?.length || 0
    if (totalLessons === 0) return

    // 3. Count completed lessons in lesson_progress
    const { data: completedLessonsData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('enrollment_id', enrollmentId)
        .eq('is_completed', true)

    const completedLessonIds = completedLessonsData?.map(l => l.lesson_id) || []
    const completedCount = completedLessonIds.length

    // 4. Calculate Percentage
    const percentage = Math.min(100, Math.round((completedCount / totalLessons) * 100))

    // 5. Update Enrollment
    const { error } = await supabase
        .from('enrollments')
        .update({
            progress: percentage,
            completed_lessons: completedLessonIds, // Cache IDs for faster lookup
            status: percentage === 100 ? 'completed' : 'active',
            completed_at: percentage === 100 ? new Date().toISOString() : null
        })
        .eq('id', enrollmentId)

    if (error) {
        console.error("Error updating course progress:", error)
    }

    revalidatePath(`/portal/student/courses/${enrollment.course_id}`)
    revalidatePath('/portal/student')
}

/**
 * Marks a specific lesson as complete for a student
 */
export async function markLessonComplete(courseId: string, lessonId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    // 1. Get Enrollment
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (!enrollment) return { error: "Not enrolled in this course" }

    // 2. Upsert Lesson Progress
    const { error: progressError } = await supabase
        .from('lesson_progress')
        .upsert({
            enrollment_id: enrollment.id,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
        }, { onConflict: 'enrollment_id, lesson_id' })

    if (progressError) {
        console.error("Error marking lesson complete:", progressError)
        return { error: "Failed to update lesson progress" }
    }

    // 3. Trigger Overall Progress Update
    await updateCourseProgress(enrollment.id)

    return { success: true }
}
