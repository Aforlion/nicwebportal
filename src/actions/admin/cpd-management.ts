'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"

export async function getCPDSubmissions() {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data, error } = await supabase
            .from('cpd_activities')
            .select(`
                *,
                membership:memberships(
                    nic_id,
                    user_id,
                    profiles(
                        full_name
                    )
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching CPD submissions:', error)
            return { error: 'Failed to fetch CPD submissions' }
        }

        const submissions = data.map((item: any) => ({
            id: item.id,
            memberName: item.membership?.profiles?.full_name || 'Unknown',
            memberID: item.membership?.nic_id || 'N/A',
            activity: item.title,
            provider: item.provider,
            points: item.points,
            date: new Date(item.activity_date).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }),
            status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            certificate: !!item.certificate_url,
            certificateUrl: item.certificate_url
        }))

        // Stats
        const stats = {
            pending: data.filter(s => s.status === 'pending').length,
            approvedThisMonth: data.filter(s => {
                const date = new Date(s.activity_date)
                const now = new Date()
                return s.status === 'approved' &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
            }).length,
            rejected: data.filter(s => s.status === 'rejected').length
        }

        return { submissions, stats }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}

export async function updateCPDStatus(id: string, status: 'approved' | 'rejected', reason?: string) {
    const profile = await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { error } = await supabase
            .from('cpd_activities')
            .update({
                status,
                rejection_reason: reason,
                reviewed_by: profile.id,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) {
            console.error('Error updating CPD status:', error)
            return { error: 'Failed to update status' }
        }

        revalidatePath('/admin/cpd-review')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Unauthorized' }
    }
}
