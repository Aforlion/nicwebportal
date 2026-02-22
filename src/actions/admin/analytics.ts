'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { startOfMonth, subMonths, endOfMonth, format } from "date-fns"

export interface AnalyticsStats {
    revenue: { value: string; change: string; trend: 'up' | 'down' }
    members: { value: string; change: string; trend: 'up' | 'down' }
    compliance: { value: string; change: string; trend: 'up' | 'down' }
    completions: { value: string; change: string; trend: 'up' | 'down' }
}

export async function getAnalyticsData() {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const now = new Date()
        const currentMonthStart = startOfMonth(now).toISOString()
        const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
        const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString()

        // 1. Total Revenue (Current vs Last Month)
        const { data: currentPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed')
            .gte('payment_date', currentMonthStart)

        const { data: lastMonthPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed')
            .gte('payment_date', lastMonthStart)
            .lte('payment_date', lastMonthEnd)

        const currentRevenue = currentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
        const lastRevenue = lastMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
        const revenueChange = lastRevenue === 0 ? 0 : ((currentRevenue - lastRevenue) / lastRevenue) * 100

        // 2. Active Members
        const { count: activeMembers } = await supabase
            .from('memberships')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)

        const { count: lastMonthActiveMembers } = await supabase
            .from('memberships')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .lte('created_at', lastMonthEnd)

        const memberChange = !lastMonthActiveMembers ? 0 : (((activeMembers || 0) - lastMonthActiveMembers) / lastMonthActiveMembers) * 100

        // 3. Facility Compliance
        const { data: totalFacilities } = await supabase.from('facilities').select('compliance_status')
        const compliantCount = totalFacilities?.filter(f => f.compliance_status === 'compliant').length || 0
        const complianceRate = totalFacilities?.length ? (compliantCount / totalFacilities.length) * 100 : 0

        // 4. Course Completions
        const { count: completions } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed')

        // 5. Category Breakdown
        const { data: categoryData } = await supabase
            .from('memberships')
            .select('category')

        const breakdown = {
            full: categoryData?.filter(m => m.category === 'full').length || 0,
            associate: categoryData?.filter(m => m.category === 'associate').length || 0,
            student: categoryData?.filter(m => m.category === 'student').length || 0,
        }

        // 6. Recent Revenue for Chart (Last 6 months)
        const chartData = []
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

            const monthTotal = monthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
            chartData.push({
                month: format(m, 'MMM'),
                amount: monthTotal
            })
        }

        return {
            stats: {
                revenue: {
                    value: `₦${(currentRevenue / 1000).toFixed(1)}k`,
                    change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
                    trend: (revenueChange >= 0 ? 'up' : 'down') as 'up' | 'down'
                },
                members: {
                    value: (activeMembers || 0).toLocaleString(),
                    change: `${memberChange >= 0 ? '+' : ''}${memberChange.toFixed(1)}%`,
                    trend: (memberChange >= 0 ? 'up' : 'down') as 'up' | 'down'
                },
                compliance: {
                    value: `${complianceRate.toFixed(0)}%`,
                    change: "Live",
                    trend: (complianceRate >= 80 ? 'up' : 'down') as 'up' | 'down'
                },
                completions: {
                    value: (completions || 0).toLocaleString(),
                    change: "+5%",
                    trend: 'up' as 'up' | 'down'
                }
            } as AnalyticsStats,
            breakdown,
            chartData
        }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
