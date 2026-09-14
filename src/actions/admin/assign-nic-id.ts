'use server'

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { env } from "@/env"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"
import { NICWelcomeEmail } from "@/emails/NIC_Welcome"
import * as React from "react"

export async function assignNicIdAction(targetId: string) {
  await requireAdmin()

  try {
    const supabaseAdmin = createAdminClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', targetId)
      .maybeSingle()

    if (profileError || !profile) {
      console.error('Profile query error:', profileError)
      return { success: false, error: 'User profile not found.' }
    }

    const targetUserId = profile.id

    // 2. Fetch or create membership
    const { data: existingMembership } = await supabaseAdmin
      .from('memberships')
      .select('id, nic_id, category')
      .eq('user_id', targetUserId)
      .maybeSingle()

    let nic_id = existingMembership?.nic_id

    // Generate NIC ID if missing
    if (!nic_id) {
      const year = new Date().getFullYear()
      const random = Math.random().toString(36).substring(2, 7).toUpperCase()
      nic_id = `NIC/MEM/${year}/${random}`
    }

    if (existingMembership) {
      await supabaseAdmin
        .from('memberships')
        .update({
          nic_id,
          status: 'active',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMembership.id)
    } else {
      await supabaseAdmin
        .from('memberships')
        .insert({
          user_id: targetUserId,
          nic_id,
          category: 'student',
          status: 'active',
          is_active: true,
          created_at: new Date().toISOString()
        })
    }

    // 3. Generate auth password setup link
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase()
    
    try {
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, { 
        password: tempPassword,
        email_confirm: true 
      })
    } catch (authErr) {
      console.warn('Auth password update warning:', authErr)
    }

    const baseUrl = env.NEXT_PUBLIC_APP_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://nicnigeria.org')
    
    let actionLink = `${baseUrl}/login`
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: profile.email,
        options: {
          redirectTo: `${baseUrl}/reset-password`
        }
      })
      if (linkData?.properties?.action_link) {
        actionLink = linkData.properties.action_link
      }
    } catch (linkErr) {
      console.warn('Generate link warning:', linkErr)
    }

    // 4. Send Welcome Email with assigned NIC ID & Portal Access Link
    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: `Welcome to NIC! Your Registration ID is ${nic_id}`,
        template: React.createElement(NICWelcomeEmail, {
          fullName: profile.full_name || 'Caregiver',
          loginUrl: actionLink,
          temporaryPassword: tempPassword,
          mode: 'welcome'
        })
      })
    }

    revalidatePath('/admin/members')
    revalidatePath('/admin/students')
    return { success: true, nic_id, emailSentTo: profile.email }
  } catch (err: any) {
    console.error('assignNicIdAction unexpected error:', err)
    return { success: false, error: err.message || 'Failed to assign NIC ID and send welcome email' }
  }
}

