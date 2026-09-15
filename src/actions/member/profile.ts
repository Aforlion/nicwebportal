'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function ensureUserMembership(userId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

    if (membership?.id) return membership.id

    // Self-healing: create missing membership record using admin client
    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle()

        const userRole = profile?.role || 'member'
        const year = new Date().getFullYear()
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
        const nicId = userRole === 'student' ? `NIC/STU/${year}/${rand}` : `NIC/MEM/${year}/${rand}`
        let category = 'full'
        if (userRole === 'student') category = 'student'
        else if (userRole === 'facility_admin') category = 'corporate'

        const { data: newMem, error: insertErr } = await supabaseAdmin
            .from('memberships')
            .insert({
                user_id: userId,
                nic_id: nicId,
                category,
                status: 'active',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single()

        if (insertErr) {
            console.error('Failed to auto-create membership in profile action:', insertErr)
            return null
        }

        return newMem?.id || null
    } catch (err) {
        console.error('Unexpected error in ensureUserMembership:', err)
        return null
    }
}

export async function getMemberProfile() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Ensure membership record exists
    await ensureUserMembership(user.id)

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            *,
            memberships (
                id,
                nic_id,
                category,
                status,
                is_active,
                expiry_date,
                created_at,
                address,
                date_of_birth,
                gender,
                qualification,
                years_of_experience,
                photo_url
            )
        `)
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching member profile:', error)
        return { error: 'Failed to fetch profile' }
    }

    const membership = profile.memberships?.[0]

    return {
        profile: {
            fullName: profile.full_name,
            email: profile.email,
            phone: profile.phone || '',
            // Fetch from membership instead of profile
            address: membership?.address || '',
            dateOfBirth: membership?.date_of_birth || '',
            gender: membership?.gender || '',
            qualification: membership?.qualification || '',
            experience: membership?.years_of_experience ? String(membership.years_of_experience) : '',
            membershipCategory: membership?.category || '',
            memberID: membership?.nic_id || 'Pending',
            joinedDate: membership?.created_at
                ? new Date(membership.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : 'Pending',
            expiryDate: membership?.expiry_date
                ? new Date(membership.expiry_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Pending',
            status: membership?.is_active ? 'Active' : 'Inactive',
            membershipId: membership?.id,
            // Prioritize membership photo_url, fallback to profile avatar_url
            photoUrl: membership?.photo_url || profile.avatar_url || null,
        }
    }
}


export async function updateMemberProfile(formData: any) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Update Profile table (basic info)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            full_name: formData.fullName,
            phone: formData.phone,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Error updating basic profile:', profileError)
        return { error: 'Failed to update basic information' }
    }

    // 2. Ensure membership record exists (self-healing)
    await ensureUserMembership(user.id)

    // Sanitize fields for PostgreSQL column types
    const sanitizedDob = formData.dateOfBirth && String(formData.dateOfBirth).trim() !== '' 
        ? String(formData.dateOfBirth).trim() 
        : null

    const sanitizedExp = formData.experience !== undefined && formData.experience !== null && String(formData.experience).trim() !== '' && !isNaN(parseInt(String(formData.experience).trim(), 10))
        ? parseInt(String(formData.experience).trim(), 10)
        : null

    // 3. Update Memberships table (member details)
    const { error: membershipError } = await supabase
        .from('memberships')
        .update({
            address: formData.address || null,
            date_of_birth: sanitizedDob,
            gender: formData.gender || null,
            qualification: formData.qualification || null,
            years_of_experience: sanitizedExp,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    if (membershipError) {
        console.error('Error updating membership info:', membershipError)
        return { error: 'Failed to update member details: ' + membershipError.message }
    }

    revalidatePath('/portal', 'layout')
    return { success: true }
}

