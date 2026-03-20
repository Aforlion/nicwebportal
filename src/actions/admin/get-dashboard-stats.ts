'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getDashboardStats() {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Fetch counts in parallel
        const [
            { count: studentCount },
            { count: memberCount },
            { count: programCount },
            { count: pendingVerificationCount },
            { data: revenueData },
            { data: recentActivity }
        ] = await Promise.all([
            // Total Students
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            // Certified Members (Active)
            supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            // Active Programs (Published)
            supabase.from('programs').select('*', { count: 'exact', head: true }).eq('is_active', true),
            // Pending Verifications
            supabase.from('pending_registrations').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
            // Total Revenue
            supabase.from('enrollments').select('price:programs(price)').eq('payment_status', 'paid'),
            // Recent Activity (Mixed from different tables)
            supabase.from('pending_registrations').select('*').order('created_at', { ascending: false }).limit(5)
        ])

        // Calculate revenue
        const totalRevenue = revenueData?.reduce((acc: number, item: any) => {
            return acc + (item.price?.price || 0)
        }, 0) || 0

        // Format recent activity for UI
        const activities = recentActivity?.map((act: any) => ({
            id: act.id,
            type: act.registration_type === 'individual' ? 'Membership Registration' : 'Facility Registration',
            description: act.status === 'paid' ? `Paid verification pending: ${act.email}` : `New registration started: ${act.email}`,
            time: formatRelativeTime(new Date(act.created_at)),
            initials: act.form_data?.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??',
            status: act.status
        })) || []

        return {
            stats: [
                {
                    title: "Total Students",
                    value: (studentCount || 0).toLocaleString(),
                    description: "Total registered students",
                    trend: "neutral",
                },
                {
                    title: "Certified Members",
                    value: (memberCount || 0).toLocaleString(),
                    description: "Active official members",
                    trend: "neutral",
                },
                {
                    title: "Active Programs",
                    value: (programCount || 0).toLocaleString(),
                    description: "Published training courses",
                    trend: "neutral",
                },
                {
                    title: "Total Revenue",
                    value: `₦${(totalRevenue).toLocaleString()}`,
                    description: "Calculated from paid enrollments",
                    trend: "neutral",
                },
            ],
            pendingVerifications: pendingVerificationCount || 0,
            recentActivity: activities
        }
    } catch (err: any) {
        console.error("[getDashboardStats] Error:", err)
        return { error: err.message || 'Unauthorized' }
    }
}

function formatRelativeTime(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
