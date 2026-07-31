'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getMemberDashboardData() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Fetch profile and membership
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
            role,
            full_name,
            avatar_url,
            memberships (
                id,
                nic_id,
                category,
                status,
                is_active,
                expiry_date,
                created_at,
                address,
                photo_url
            )
        `)
        .eq('id', user.id)
        .single()

    if (profileError || !profileData) {
        console.error('Error fetching member profile:', profileError)
        return { error: 'Failed to fetch member details' }
    }

    if (profileData.role === 'facility_admin') {
        return { redirect: '/portal/facility' }
    }

    if (profileData.role === 'student') {
        return { redirect: '/portal/student' }
    }

    const membership = profileData.memberships?.[0]
    if (!membership) {
        return { error: 'No active membership found' }
    }

    // 2. Fetch CPD Activities
    const { data: cpdData } = await supabase
        .from('cpd_activities')
        .select('*')
        .eq('membership_id', membership.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

    const totalCPDPoints = cpdData?.reduce((sum, a) => sum + Number(a.points || 0), 0) || 0
    const recentLogs = cpdData?.slice(0, 2).map(a => ({
        title: a.title, // Fixed column name
        date: new Date(a.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), // Fixed column name
        points: `+${a.points}`
    })) || []

    // 3. Check for outstanding dues
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('membership_id', membership.id) 
        .in('payment_type', ['membership_fee', 'membership_dues']) // Check both legacy and current formats
        // Check if there's a payment for the current year cycle
        .gte('payment_date', new Date(new Date().getFullYear(), 0, 1).toISOString())

    const hasOutstandingDues = !payments || payments.length === 0

    // 4. Fetch Active Enrollments (Unification)
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            id,
            status,
            enrolled_at,
            courses (
                id,
                title,
                thumbnail_url
            )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'enrolled'])
        .order('enrolled_at', { ascending: false })

    const activeEnrollments = enrollments?.filter((e: any) => e.courses).map((e: any) => ({
        id: e.id,
        courseId: e.courses.id,
        title: e.courses.title,
        thumbnail: e.courses.thumbnail_url,
        status: e.status
    })) || []

    const profileComplete = !!(membership?.address && (membership?.photo_url || profileData.avatar_url))

    return {
        member: {
            name: profileData.full_name,
            nicId: membership.nic_id,
            category: membership.category,
            status: (membership.is_active || membership.status?.toLowerCase() === 'active') ? 'ACTIVE' : 'INACTIVE',
            joined: membership.created_at
                ? new Date(membership.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : 'Pending',
            expiry: membership.expiry_date
                ? new Date(membership.expiry_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Pending',
            renewalDate: membership.expiry_date || null
        },
        cpd: {
            points: totalCPDPoints,
            target: 30,
            progress: Math.min(Math.round((totalCPDPoints / 30) * 100), 100),
            logs: recentLogs
        },
        hasOutstandingDues,
        activeEnrollments,
        profileComplete
    }
}
