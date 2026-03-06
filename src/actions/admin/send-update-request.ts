'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { NICProfileUpdateRequestEmail } from "@/emails/NIC_ProfileUpdateRequest"
import * as React from "react"

export async function sendProfileUpdateRequestAction(profileId: string) {
  await requireAdmin()

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Fetch profile for name + email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    await sendEmail({
      to: profile.email,
      subject: 'Action Required: Please Update Your NIC Profile Information',
      template: React.createElement(NICProfileUpdateRequestEmail, {
        fullName: profile.full_name
      })
    })

    return { success: true }
  } catch (err: any) {
    console.error('sendProfileUpdateRequestAction error:', err)
    return { success: false, error: err.message || 'Failed to send update request' }
  }
}

