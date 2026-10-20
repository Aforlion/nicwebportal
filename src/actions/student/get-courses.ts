'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getStudentLevel } from "@/actions/get-student-progress"
import { isEligibleForCourse } from "@/lib/level-utils"

export async function getStudentCoursesData() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { myCourses: [], availableCourses: [] }

    // 1. Fetch all courses
    const { data: allCourses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    if (coursesError) {
        console.error('Error fetching courses:', coursesError)
        return { error: 'Failed to fetch courses' }
    }

    // 2. Fetch my enrollments
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            *,
            course:courses(*)
        `)
        .eq('user_id', user.id)

    const enrolledIds = new Set(enrollments?.map(e => e.course_id) || [])

    // 3. Fetch user membership, role & academic level to evaluate eligibility
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, training_facility_id')
        .eq('id', user.id)
        .single()

    const { data: member } = await supabase
        .from('memberships')
        .select('category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    const academicLevel = await getStudentLevel(supabase, user.id)

    const myCourses = enrollments?.map((e: any) => ({
        id: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        description: e.course.description,
        duration: `${e.course.duration_hours || 0} Hours`,
        mode: e.course.mode || 'Online',
        category: e.course.category || 'Specialty',
        enrolled: true,
        progress: e.progress || 0,
    })) || []

    const availableCourses = (allCourses || [])
        .filter(c => !enrolledIds.has(c.id))
        .map(c => {
            const eligibility = isEligibleForCourse({
                membershipCategory: member?.category || profile?.role || 'student',
                userRole: profile?.role || 'student',
                isFacilityAdmin: profile?.role === 'facility_admin' || !!profile?.training_facility_id,
                academicLevel,
                courseLevel: c.level,
                courseSlug: c.slug,
                courseId: c.id,
                courseTitle: c.title,
                userEmail: user.email
            })

            return {
                id: c.id,
                title: c.title,
                slug: c.slug,
                description: c.description,
                duration: `${c.duration_hours || 0} Hours`,
                mode: c.mode || 'Online',
                category: c.category || 'Specialty',
                enrolled: false,
                price: c.price === 0 ? 'Free' : `₦${Number(c.price).toLocaleString()}`,
                isEligible: eligibility.eligible,
                lockReason: eligibility.reason || (!eligibility.eligible ? `Requires ${eligibility.requiredLevel}` : undefined)
            }
        })

    return { myCourses, availableCourses }
}
