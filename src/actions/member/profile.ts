'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getMemberProfile() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

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
            experience: membership?.years_of_experience || '',
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

    // 2. Update Memberships table (member details)
    const { error: membershipError } = await supabase
        .from('memberships')
        .update({
            address: formData.address,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            qualification: formData.qualification,
            years_of_experience: formData.experience,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    if (membershipError) {
        console.error('Error updating membership info:', membershipError)
        return { error: 'Failed to update member details' }
    }

    revalidatePath('/portal', 'layout')
    return { success: true }
}
