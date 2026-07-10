'use server'

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { requireAdmin } from "@/lib/auth"
import { startOfMonth, subMonths, endOfMonth } from "date-fns"

export async function getDashboardStats() {
    await requireAdmin()
    try {
        const supabase = createAdminClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const now = new Date()
        const currentMonthStart = startOfMonth(now).toISOString()
        const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
        const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString()

        // Fetch counts in parallel
        const [
            { count: studentCount },
            { count: lastMonthStudentCount },
            { count: memberCount },
            { count: lastMonthMemberCount },
            { count: programCount },
            { count: pendingVerificationCount },
            { data: revenueData },
            { data: lastMonthRevenueData },
            { data: recentActivity }
        ] = await Promise.all([
            // Total Students (Current)
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            // Total Students (Last month)
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').lte('created_at', lastMonthEnd),
            // Certified Members (Active)
            supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            // Certified Members (Last Month)
            supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active').lte('created_at', lastMonthEnd),
            // Active Programs (Published)
            supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
            // Pending Verifications
            supabase.from('pending_registrations').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
            // Total Revenue (All time)
            supabase.from('payments').select('amount').eq('status', 'completed'),
            // Last Month Revenue
            supabase.from('payments').select('amount').eq('status', 'completed').gte('payment_date', lastMonthStart).lte('payment_date', lastMonthEnd),
            // Recent Activity (Mixed from different tables)
            supabase.from('pending_registrations').select('*').order('created_at', { ascending: false }).limit(5)
        ])

        // Calculate revenue
        const totalRevenue = revenueData?.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0) || 0
        const lastMonthRevenue = lastMonthRevenueData?.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0) || 0

        // Calculate trends
        const prevStudents = lastMonthStudentCount || 0
        const studentDiff = (studentCount || 0) - prevStudents
        const studentChange = prevStudents === 0 ? 0 : (studentDiff / prevStudents) * 100

        const prevMembers = lastMonthMemberCount || 0
        const memberDiff = (memberCount || 0) - prevMembers
        const memberChange = prevMembers === 0 ? 0 : (memberDiff / prevMembers) * 100

        const revenueChange = lastMonthRevenue === 0 ? 0 : ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

        // Format recent activity for UI
        const activities = recentActivity?.map((act: any) => ({
            id: act.id,
            type: act.registration_type === 'individual' ? 'Membership Registration' : 'Facility Registration',
            description: act.status === 'paid' ? `Paid verification pending: ${act.email}` : `New registration started: ${act.email}`,
            time: formatRelativeTime(new Date(act.created_at)),
            initials: extractInitials(act.form_data),
            status: act.status
        })) || []

        // Monthly trends for chart
        const monthlyRevenue = []
        for (let i = 5; i >= 0; i--) {
            const m = subMonths(now, i)
            const ms = startOfMonth(m).toISOString()
            const me = endOfMonth(m).toISOString()

            const { data: monthPayments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'completed')
                .gte('payment_date', ms)
                .lte('payment_date', me)

            const monthTotal = monthPayments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
            monthlyRevenue.push({
                month: m.toLocaleString('en-US', { month: 'short' }),
                amount: monthTotal
            })
        }

        return {
            stats: [
                {
                    title: "Total Students",
                    value: (studentCount || 0).toLocaleString(),
                    description: "Total registered students",
                    change: `${studentChange >= 0 ? '+' : ''}${studentChange.toFixed(1)}%`,
                    trend: studentChange > 0 ? "up" : studentChange < 0 ? "down" : "neutral",
                },
                {
                    title: "Certified Members",
                    value: (memberCount || 0).toLocaleString(),
                    description: "Active official members",
                    change: `${memberChange >= 0 ? '+' : ''}${memberChange.toFixed(1)}%`,
                    trend: memberChange > 0 ? "up" : memberChange < 0 ? "down" : "neutral",
                },
                {
                    title: "Active Programs",
                    value: (programCount || 0).toLocaleString(),
                    description: "Published training courses",
                    change: "Active",
                    trend: "neutral",
                },
                {
                    title: "Total Revenue",
                    value: `₦${(totalRevenue).toLocaleString()}`,
                    description: "All-time completed payments",
                    change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
                    trend: revenueChange > 0 ? "up" : revenueChange < 0 ? "down" : "neutral",
                },
            ],
            pendingVerifications: pendingVerificationCount || 0,
            recentActivity: activities,
            monthlyRevenue
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

function extractInitials(formData: any): string {
    if (!formData) return '??';

    const name = formData.fullName || formData.ownerFullName || formData.facilityName;
    if (!name || typeof name !== 'string') return '??';

    return name
        .split(' ')
        .filter((part: string) => part.length > 0)
        .map((part: string) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || '??';
}
