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

    // Determined "Continue Learning" (most recent active course)
    const activeEnrollment = enrollments.find((e: any) => e.status === 'active')

    // Fetch upcoming events from news_events where category is event
    const { data: events } = await supabase
        .from('news_events')
        .select('*')
        .eq('category', 'event')
        .gte('published_at', new Date().toISOString())
        .order('published_at', { ascending: true })
        .limit(2)

    // Generate dynamic tip based on progress
    const completedCount = enrollments.filter((e: any) => e.status === 'completed').length
    const activeCount = enrollments.filter((e: any) => e.status === 'active' || e.status === 'enrolled').length

    let tip = "Complete your **enrolled modules** and log your **hours** to become eligible for the National Registry."
    if (completedCount > 0) {
        tip = "Great job! You've completed some modules. Keep going to earn your full certification."
    } else if (activeCount > 0) {
        tip = "Start your first lesson today! Even 15 minutes of study moves you closer to certification."
    }

    return {
        enrollments,
        recent: activeEnrollment || null,
        events: events || [],
        tip
    }
}
