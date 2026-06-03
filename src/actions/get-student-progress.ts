import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getStudentDashboardData() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { enrollments: [], recent: null, profileComplete: true }

    // Fetch profile for completeness check
    const { data: profileData } = await supabase
        .from('profiles')
        .select('address, photo_url')
        .eq('id', user.id)
        .single()

    const profileComplete = !!(profileData?.address && profileData?.photo_url)

    // Fetch enrollments with course details
    const { data: rawEnrollments, error } = await supabase
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
        .order('enrolled_at', { ascending: false })

    if (error) {
        console.error('Error fetching enrollments:', error)
        return { enrollments: [], recent: null }
    }

    const enrollments = rawEnrollments.filter((e: any) => {
        const course = Array.isArray(e.course) ? e.course[0] : e.course;
        return course != null;
    });

    // Determined "Continue Learning" (most recent active course)
    const activeEnrollment = enrollments.find((e: any) => e.status === 'active' || e.status === 'enrolled')

    // Fetch upcoming events from news_events where type is event
    const { data: events } = await supabase
        .from('news_events')
        .select('*')
        .eq('type', 'event')
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

    // Fetch CPD credits for current year
    let cpdCredits = 0
    try {
        const currentYear = new Date().getFullYear()
        
        // 1. Get official credits from cpd_records
        const { data: cpdData } = await supabase
            .from('cpd_records')
            .select('credits')
            .eq('user_id', user.id)
            .eq('year', currentYear)

        if (cpdData) {
            cpdCredits += cpdData.reduce((acc: number, curr: any) => acc + curr.credits, 0)
        }

        // 2. Get approved points from cpd_activities
        const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (membership) {
            const { data: activityData } = await supabase
                .from('cpd_activities')
                .select('points')
                .eq('membership_id', membership.id)
                .eq('status', 'approved')
                // Optionally filter by activity_date year if required
            
            if (activityData) {
                cpdCredits += activityData.reduce((acc: number, curr: any) => acc + (curr.points || 0), 0)
            }
        }
    } catch (e) {
        console.warn('CPD records error:', e)
    }

    const currentLevel = await getStudentLevel(supabase, user.id, enrollments)

    return {
        enrollments,
        recent: activeEnrollment || null,
        events: events || [],
        tip,
        cpdCredits,
        currentLevel,
        profileComplete
    }
}

export async function getStudentLevel(supabase: any, userId: string, enrollments?: any[]) {
    let localEnrollments: any[] = enrollments || []
    
    if (localEnrollments.length === 0) {
        const { data } = await supabase
            .from('enrollments')
            .select('status, course:courses (level)')
            .eq('user_id', userId)
        localEnrollments = data || []
    }

    // Determine current level based on highest completed course level
    // Fallback to Level 1 if no courses completed
    let currentLevel = 1
    const completedLevels = localEnrollments
        .filter((e: any) => e.status === 'completed' && e.course?.level)
        .map((e: any) => {
            const levelMatch = e.course.level.match(/Level (\d+)/i)
            if (levelMatch) return parseInt(levelMatch[1])
            
            // Map string levels
            if (e.course.level === 'Foundation') return 1
            if (e.course.level === 'Intermediate') return 2
            if (e.course.level === 'Advanced') return 3
            return 1
        })
    
    if (completedLevels.length > 0) {
        currentLevel = Math.max(...completedLevels)
    }

    return currentLevel
}
