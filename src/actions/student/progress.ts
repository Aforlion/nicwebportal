'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Recalculates the course progress percentage based on completed lessons
 */
export async function updateCourseProgress(enrollmentId: string, targetUserId?: string) {
    const { supabaseAdmin } = await import("@/lib/supabase/admin")
    const supabase = supabaseAdmin // Use admin client to bypass RLS during system-level recounts

    // 1. Get Course ID, current state
    const query = supabase
        .from('enrollments')
        .select('course_id, completed_lessons, user_id, program_id')
        .eq('id', enrollmentId)

    // If targetUserId is provided, we use it for extra validation
    if (targetUserId) {
        query.eq('user_id', targetUserId)
    }

    const { data: enrollment } = await query.single()
    if (!enrollment) return

    // 2. Fetch all modules for this course via junction table
    const { data: courseModules } = await supabase
        .from('course_modules')
        .select('module_id')
        .eq('course_id', enrollment.course_id)

    const moduleIds = courseModules?.map(cm => cm.module_id) || []

    // Also check if modules are linked directly (legacy/fallback)
    const { data: directModules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', enrollment.course_id)
    
    if (directModules) {
        directModules.forEach(m => {
            if (!moduleIds.includes(m.id)) moduleIds.push(m.id)
        })
    }

    if (moduleIds.length === 0) return

    // 3. Fetch all lessons for these modules
    const { data: allLessons } = await supabase
        .from('lessons')
        .select('id')
        .in('module_id', moduleIds)

    const totalLessons = allLessons?.length || 0
    if (totalLessons === 0) return

    // 4. Count completed lessons in lesson_progress
    const { data: completedLessonsData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('enrollment_id', enrollmentId)
        .eq('is_completed', true)

    const completedLessonIds = completedLessonsData?.map(l => l.lesson_id) || []
    const completedCount = completedLessonIds.length

    // 5. Calculate Percentage
    const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0

    // 6. Update Enrollment - Use supabaseAdmin to bypass RLS restrictions
    const { error: updateError } = await supabase
        .from('enrollments')
        .update({
            progress: percentage,
            completed_lessons: completedLessonIds,
            status: percentage === 100 ? 'completed' : 'active',
            completed_at: percentage === 100 ? new Date().toISOString() : null,
        } as any)
        .eq('id', enrollmentId)

    if (updateError) {
        console.error("Error updating course progress:", updateError)
        return
    }

    // 7. Auto-issue Certificate if 100%
    if (percentage === 100) {
        try {
            // Import issueCertificate dynamically to avoid circular dependencies if any
            const { issueCertificate } = await import("./certificate")
            await issueCertificate(enrollment.course_id, enrollment.user_id)
        } catch (e) {
            console.error("Auto-certificate issuance failed:", e)
        }
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
