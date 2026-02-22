import { createClient as createBrowserClient } from '@/lib/supabase'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSupabase() {
    if (typeof window === 'undefined') {
        const cookieStore = await cookies()
        return createServerClient(cookieStore)
    }
    return createBrowserClient()
}

export async function getUser() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getUserProfile() {
    const supabase = await getSupabase()
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

export async function requireRole(allowedRoles: string[]) {
    const profile = await getUserProfile()

    if (!profile || !allowedRoles.includes(profile.role)) {
        // Log unauthorized attempt? 
        // For production hardening, we redirect to a generic safe place or login
        if (!profile) redirect('/login')
        redirect('/portal/member')
    }
    return profile
}

export async function requireAdmin() {
    return requireRole(['admin', 'super_admin'])
}

export async function requireStaff() {
    return requireRole(['admin', 'super_admin', 'registry_officer', 'inspector', 'auditor', 'instructor'])
}

export async function requireInspector() {
    return requireRole(['admin', 'super_admin', 'inspector'])
}

export async function getMembership(userId: string) {
    const supabase = await getSupabase()

    const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .single()

    return membership
}
