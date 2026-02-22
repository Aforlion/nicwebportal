'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getMemberPayments() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Fetch membership details for context
    const { data: membership } = await supabase
        .from('memberships')
        .select(`
            *,
            cpd:cpd_activities(points, status)
        `)
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'Membership not found' }

    // 2. Fetch payments
    const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('membership_id', membership.id)
        .order('payment_date', { ascending: false })

    if (error) {
        console.error('Error fetching payments:', error)
        return { error: 'Failed to fetch payments' }
    }

    // 3. Calculate CPD points for renewal check
    const totalCPDPoints = membership.cpd
        ?.filter((a: any) => a.status === 'approved')
        ?.reduce((sum: number, a: any) => sum + Number(a.points || 0), 0) || 0

    const formattedPayments = payments.map(p => ({
        id: p.id,
        date: p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending',
        amount: Number(p.amount),
        type: p.payment_type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
        receipt: p.receipt_number || 'N/A',
        url: p.receipt_url
    }))

    return {
        payments: formattedPayments,
        membership: {
            category: membership.category,
            expiryDate: new Date(membership.expiry_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            isActive: membership.is_active,
            cpdPoint: totalCPDPoints,
            cpdTarget: 30
        }
    }
}
