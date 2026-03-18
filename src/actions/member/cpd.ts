'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getMemberCPDData() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get the user's membership ID
    const { data: membership, error: mError } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (mError || !membership) {
        return { activities: [], totalPoints: 0, approvedCount: 0, certificateCount: 0 }
    }

    // Fetch all CPD activities for this membership
    const { data: activities, error } = await supabase
        .from('cpd_activities')
        .select('*')
        .eq('membership_id', membership.id)
        .order('activity_date', { ascending: false })

    if (error) {
        console.error('Error fetching CPD activities:', error)
        return { error: 'Failed to fetch CPD records' }
    }

    const approved = activities?.filter(a => a.status === 'approved') || []
    const totalPoints = approved.reduce((sum, a) => sum + Number(a.points || 0), 0)
    const certificateCount = activities?.filter(a => !!a.certificate_url).length || 0

    return {
        activities: (activities || []).map(a => ({
            id: a.id,
            title: a.title,
            provider: a.provider || '',
            date: a.activity_date
                ? new Date(a.activity_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : '',
            type: a.activity_type || 'Other',
            points: a.points,
            status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
            certificateUrl: a.certificate_url || null,
            description: a.description || '',
        })),
        totalPoints,
        approvedCount: approved.length,
        certificateCount,
        membershipId: membership.id,
    }
}

export async function logCPDActivity(formData: {
    title: string
    provider: string
    activityType: string
    description: string
    activityDate: string
    points: number
    membershipId: string
}) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('cpd_activities')
        .insert({
            membership_id: formData.membershipId,
            title: formData.title,
            provider: formData.provider,
            activity_type: formData.activityType,
            description: formData.description,
            activity_date: formData.activityDate,
            points: formData.points,
            status: 'pending', // Admin must approve
        })

    if (error) {
        console.error('Error logging CPD activity:', error)
        return { error: 'Failed to log activity. Please try again.' }
    }

    revalidatePath('/portal/member/cpd')
    return { success: true }
}
