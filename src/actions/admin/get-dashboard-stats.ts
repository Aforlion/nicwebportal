'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"

export async function getDashboardStats() {
    try {
        await requireAdmin()

        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Fetch counts in parallel
        const [
            { count: studentCount },
            { count: memberCount },
            { count: programCount },
            { data: revenueData }
        ] = await Promise.all([
            // Total Students
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            // Certified Members (Active)
            supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            // Active Programs (Published)
            supabase.from('programs').select('*', { count: 'exact', head: true }).eq('is_published', true),
            // Total Revenue (rough sum from payments table if it exists, otherwise mockup for now)
            supabase.from('enrollments').select('price:programs(price)').eq('payment_status', 'paid')
        ])

        // Calculate revenue
        const totalRevenue = revenueData?.reduce((acc: number, item: any) => {
            return acc + (item.programs?.price || 0)
        }, 0) || 0

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
            ]
        }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
