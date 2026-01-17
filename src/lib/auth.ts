import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getUserProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

export async function requireAuth() {
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }
    return user
}

export async function requireAdmin() {
    const profile = await getUserProfile()
    if (!profile || profile.role !== 'admin') {
        redirect('/portal/member')
    }
    return profile
}

export async function getMembership(userId: string) {
    const supabase = createClient()

    const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .single()

    return membership
}
