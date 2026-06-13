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
      .select('id, nic_id')
      .eq('user_id', profileId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking membership:', checkError)
      return { success: false, error: `Database error checking existing record: ${checkError.message}` }
    }

    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    const new_nic_id = `NIC/MEM/${year}/${random}`

    let result;
    if (existingMembership) {
      const updateData: any = {
        status: 'active',
        updated_at: new Date().toISOString()
      }
      if (!existingMembership.nic_id) {
        updateData.nic_id = new_nic_id
      }

      result = await supabase
        .from('memberships')
        .update(updateData)
        .eq('id', existingMembership.id)
    } else {
      result = await supabase
        .from('memberships')
        .insert({
          user_id: profileId,
          status: 'active',
          category: 'student', // default for admitted members
          nic_id: new_nic_id,
          joined_date: new Date().toISOString().split('T')[0]
        })
    }

    if (result.error) {
      console.error('Error updating/inserting membership:', result.error)
      return { success: false, error: `Failed to update membership status: ${result.error.message}` }
    }

    // 3. Process Pending Registration (Courses & Payments)
    const { data: pendingReg } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', profile.email)
      .maybeSingle()

    if (pendingReg && pendingReg.form_data) {
      const formData = pendingReg.form_data as any
      const membershipRecordId = existingMembership?.id || (result.data as any)?.id

      // a. Create Enrollments
      if (Array.isArray(formData.courses_paid)) {
        for (const course of formData.courses_paid) {
          await supabase.from('enrollments').upsert({
            user_id: profileId,
            course_id: course.id,
            status: 'active'
          }, { onConflict: 'user_id,course_id' })
        }
      }

      // b. Create Payment Records (if membership ID exists)
      if (membershipRecordId) {
        // Membership Payment
        if (formData.membership_paid) {
          await supabase.from('payments').insert({
            membership_id: membershipRecordId,
            amount: formData.category === 'student' ? 35000 : 50000,
            payment_type: 'membership_dues',
            payment_method: 'bank_transfer',
            status: 'completed',
            transaction_reference: `AUTO-ADMIT-MEM-${profileId.substring(0, 5)}`,
            payment_date: pendingReg.updated_at || new Date().toISOString()
          })
        }

        // Course Payment
        if (formData.total_paid && Number(formData.total_paid) > 0) {
          await supabase.from('payments').insert({
            membership_id: membershipRecordId,
            amount: Number(formData.total_paid),
            payment_type: 'course_fee',
            payment_method: 'bank_transfer',
            status: 'completed',
            transaction_reference: `AUTO-ADMIT-COURSE-${profileId.substring(0, 5)}`,
            payment_date: pendingReg.updated_at || new Date().toISOString()
          })
        }
      }

      // c. Update pending registration status
      await supabase.from('pending_registrations').update({ status: 'admitted' }).eq('id', pendingReg.id)
    }

    // 4. Send admission email & trigger account setup (Consolidated & Reliable)
    const baseUrl = env.NEXT_PUBLIC_APP_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://nicnigeria.org')

    // Generate the recovery/setup link using Admin API
    const supabaseAdmin = createAdminClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Confirm the user's email since an admin is admitting them
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase()
    await supabaseAdmin.auth.admin.updateUserById(profileId, { 
      email_confirm: true,
      password: tempPassword
    })


    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
      options: {
        // Route through /auth/callback so the PKCE code is exchanged
        // before the user reaches the reset-password form.
        redirectTo: `${baseUrl}/auth/callback?next=/reset-password`
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
        resetUrl: linkData?.properties?.action_link,
        temporaryPassword: tempPassword
      })
    })

    revalidatePath('/admin/members')
    return { success: true }
  } catch (err: any) {
    console.error('admitMemberAction unexpected error:', err)
    return { success: false, error: err.message || 'Failed to admit member' }
  }
}
