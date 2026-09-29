'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cookies, headers as getHeaders } from "next/headers"
import { PremiumCertificateData, MemberTierKey } from "@/types/certificate"

export async function getIndividualMemberCertificateDetails(targetUserId?: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    let userId: string

    if (targetUserId) {
      userId = targetUserId
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: "Unauthenticated" }
      userId = user.id
    }

    // 1. Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) {
      return { error: "User profile not found." }
    }

    // 2. Fetch membership record
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // 3. Check for existing individual membership certificate in `certificates` table
    const { data: existingCert } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'individual_membership')
      .maybeSingle()

    let certCode = existingCert?.certificate_number

    if (!certCode) {
      const year = new Date().getFullYear()
      const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
      certCode = `NIC-MEM-${year}-${rand}`

      await supabaseAdmin.from('certificates').insert({
        user_id: userId,
        certificate_number: certCode,
        type: 'individual_membership',
        issue_date: membership?.created_at || profile.created_at || new Date().toISOString(),
      })
    }

    // Determine Member Tier Key
    let tierKey: MemberTierKey = 'student'
    const plan = ((membership?.plan_name || membership?.tier || profile.role || '') as string).toLowerCase()
    if (plan.includes('fellow') || plan.includes('fnic')) tierKey = 'fellow'
    else if (plan.includes('professional')) tierKey = 'professional'
    else if (plan.includes('associate') || plan.includes('caregiver') || plan.includes('certified')) tierKey = 'certified_caregiver'

    // Build Verification URL
    const headerList = await getHeaders()
    const host = headerList.get('host') || 'localhost:3000'
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    const verificationUrl = `${baseUrl}/certificates/${certCode}`

    const issueDateStr = membership?.created_at || profile.created_at || new Date().toISOString()
    const issueYear = new Date(issueDateStr).getFullYear()

    const certData: PremiumCertificateData = {
      certificateNumber: certCode,
      recipientName: profile.full_name || 'Member',
      memberTierKey: tierKey,
      category: 'individual_membership',
      issueDate: issueDateStr,
      duration: `Active Member (${issueYear} - ${issueYear + 1})`,
      verificationUrl,
      studentIdOrRegNumber: membership?.nic_id || membership?.member_id || `NIC-MEM-${userId.substring(0, 6).toUpperCase()}`,
      signatoryName: 'Olatunji Joel',
      signatoryTitle: 'Executive Director, Programmes',
      signatorySignatureUrl: '/signature.png',
    }

    return {
      success: true,
      membership,
      certificate: certData,
    }
  } catch (err: any) {
    console.error("Error in getIndividualMemberCertificateDetails:", err)
    return { error: err.message || "Failed to load individual member certificate" }
  }
}
