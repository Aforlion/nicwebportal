'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"
import { NICAdmissionConfirmationEmail } from "@/emails/NIC_AdmissionConfirmation"
import * as React from "react"
import { env } from "@/env"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function admitMemberAction(profileId: string) {
  await requireAdmin()

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 1. Fetch profile so we have name + email for the notification
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    // 2. Update membership status to active
    // We check for existence first because the database lacks a unique constraint on user_id for upsert
    const { data: existingMembership, error: checkError } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', profileId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking membership:', checkError)
      return { success: false, error: `Database error checking existing record: ${checkError.message}` }
    }

    let result;
    if (existingMembership) {
      result = await supabase
        .from('memberships')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMembership.id)
    } else {
      result = await supabase
        .from('memberships')
        .insert({
          user_id: profileId,
          status: 'active',
          category: 'student', // default for admitted members
          joined_date: new Date().toISOString().split('T')[0]
        })
    }

    if (result.error) {
      console.error('Error updating/inserting membership:', result.error)
      return { success: false, error: `Failed to update membership status: ${result.error.message}` }
    }

    // 3. Send admission email & trigger account setup (Consolidated & Reliable)
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'

    // Generate the recovery/setup link using Admin API
    const supabaseAdmin = createAdminClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
      options: {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`
      }
    })

    // Send the consolidated confirmation email
    await sendEmail({
      to: profile.email,
      subject: 'Congratulations! Your NIC Student Application Has Been Approved',
      template: React.createElement(NICAdmissionConfirmationEmail, {
        fullName: profile.full_name,
        coursesUrl: `${baseUrl}/portal/student/courses`,
        loginUrl: `${baseUrl}/login`,
        resetUrl: linkData?.properties?.action_link
      })
    })

    revalidatePath('/admin/members')
    return { success: true }
  } catch (err: any) {
    console.error('admitMemberAction unexpected error:', err)
    return { success: false, error: err.message || 'Failed to admit member' }
  }
}
