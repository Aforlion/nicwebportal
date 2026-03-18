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
                created_at
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
            address: profile.address || '',
            dateOfBirth: profile.date_of_birth || '',
            gender: profile.gender || '',
            qualification: profile.qualifications || '',
            experience: profile.years_experience || '',
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
            photoUrl: profile.photo_url || null,
        }
    }
}


export async function updateMemberProfile(formData: any) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            qualifications: formData.qualification,
            years_experience: formData.experience,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'Failed to update profile' }
    }

    revalidatePath('/portal/member/profile')
    return { success: true }
}
