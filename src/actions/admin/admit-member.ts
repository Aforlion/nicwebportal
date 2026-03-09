'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"
import { NICAdmissionConfirmationEmail } from "@/emails/NIC_AdmissionConfirmation"
import * as React from "react"
import { env } from "@/env"

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
    // Use upsert to handle cases where a membership row doesn't exist yet
    const { error: updateError } = await supabase
      .from('memberships')
      .upsert({
        user_id: profileId,
        status: 'active',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (updateError) {
      console.error('Error admitting member:', updateError)
      return { success: false, error: `Database error: ${updateError.message} (${updateError.code})` }
    }

    // 3. Send admission email
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'
    await sendEmail({
      to: profile.email,
      subject: 'Congratulations! Your NIC Student Application Has Been Approved',
      template: React.createElement(NICAdmissionConfirmationEmail, {
        fullName: profile.full_name,
        coursesUrl: `${baseUrl}/portal/student/courses`,
        loginUrl: `${baseUrl}/login`
      })
    })

    revalidatePath('/admin/members')
    return { success: true }
  } catch (err: any) {
    console.error('admitMemberAction unexpected error:', err)
    return { success: false, error: err.message || 'Failed to admit member' }
  }
}
