'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getStudentAssessmentsData() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { assessments: [] }

    // 1. Fetch assessments related to the user's enrollments
    // We join through lessons -> modules -> courses -> enrollments
    const { data, error } = await supabase
        .from('assessments')
        .select(`
            *,
            lesson:lessons(
                title,
                module:modules(
                    title,
                    course:courses(
                        id,
                        title
                    )
                )
            ),
            submissions:assessment_submissions(
                score,
                status,
                submitted_at
            )
        `)
    // Filter for assessments in courses the user is enrolled in
    // Since Supabase doesn't support deep join filtering easily in select, 
    // we'll fetch all and filter in JS for now or use a join if possible.
    // Actually, let's fetch assessments and filter by checking if user has enrollment for the course.

    if (error) {
        console.error('Error fetching assessments:', error)
        return { error: 'Failed to fetch assessments' }
    }

    // Fetch user enrollments to verify access
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)

    const enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || [])

    const filteredAssessments = data
        .filter((a: any) => {
            const courseId = a.lesson?.module?.course?.id
            return enrolledCourseIds.has(courseId)
        })
        .map((a: any) => {
            const latestSubmission = a.submissions?.sort((x: any, y: any) =>
                new Date(y.submitted_at).getTime() - new Date(x.submitted_at).getTime()
            )[0]

            return {
                id: a.id,
                course: a.lesson?.module?.course?.title || 'Unknown Course',
                title: a.title,
                status: latestSubmission?.status === 'graded' ? 'completed' :
                    latestSubmission?.status === 'submitted' ? 'submitted' : 'available',
                questions: Array.isArray(a.questions) ? a.questions.length : 0,
                score: latestSubmission?.score ? `${latestSubmission.score}%` : null,
                date: latestSubmission?.submitted_at ? new Date(latestSubmission.submitted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : null,
                timeLimit: a.time_limit ? `${a.time_limit} mins` : null,
                attempts: `${a.submissions?.length || 0}/${a.max_attempts || 2}`,
            }
        })

    return { assessments: filteredAssessments }
}
