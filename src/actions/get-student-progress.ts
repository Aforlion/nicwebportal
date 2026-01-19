import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getStudentDashboardData() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { enrollments: [], recent: null }

    // Fetch enrollments with course details
    const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
            id,
            progress,
            status,
            enrolled_at,
            course:courses (
                id,
                title,
                thumbnail_url,
                duration_hours,
                level
            )
        `)
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false, foreignTable: '' }) // Note: last_accessed is on progress, simplified for now

    if (error) {
        console.error('Error fetching enrollments:', error)
        return { enrollments: [], recent: null }
    }

    // Determine "Continue Learning" (most recent active course)
    const activeEnrollment = enrollments.find((e: any) => e.status === 'active')

    return {
        enrollments,
        recent: activeEnrollment || null
    }
}
