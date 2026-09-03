'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { headers as getHeaders } from "next/headers"
import { PremiumCertificateData, FacilityTypeKey } from "@/types/certificate"

export async function getFacilityCertificateDetails(targetFacilityId?: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    let facility: any = null

    if (targetFacilityId) {
      const { data } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', targetFacilityId)
        .single()
      facility = data
    } else {
      // Find facility belonging to owner user
      const { data } = await supabase
        .from('facilities')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()
      facility = data
    }

    if (!facility) {
      return { error: "No facility registration record found." }
    }

    // Check if an official certificate record already exists in `certificates` table
    const { data: existingCert } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('user_id', facility.owner_id || user.id)
      .eq('type', 'facility_membership')
      .maybeSingle()

    let certCode = existingCert?.certificate_number

    if (!certCode) {
      // Generate a new clean membership code (e.g. NIC-FAC-2026-AB123)
      const year = new Date().getFullYear()
      const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
      let prefix = 'FAC'
      const ft = (facility.facility_type || '').toLowerCase()
      if (ft.includes('agency')) prefix = 'AGY'
      if (ft.includes('training')) prefix = 'TRN'
      if (ft.includes('hospital') || ft.includes('clinical')) prefix = 'CLI'

      certCode = `NIC-${prefix}-${year}-${rand}`

      // Create record in `certificates` table (using admin client)
      await supabaseAdmin.from('certificates').insert({
        user_id: facility.owner_id || user.id,
        certificate_number: certCode,
        type: 'facility_membership',
        issue_date: facility.registered_at || facility.created_at || new Date().toISOString(),
      })
    }

    // Build Verification URL
    const headerList = await getHeaders()
    const host = headerList.get('host') || 'localhost:3000'
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    const verificationUrl = `${baseUrl}/certificates/${certCode}`

    // Map facility_type to FacilityTypeKey
    let typeKey: FacilityTypeKey = 'general'
    const ft = (facility.facility_type || '').toLowerCase()
    if (ft === 'agency' || ft.includes('care_agency') || ft.includes('staffing')) typeKey = 'agency'
    else if (ft === 'care_home' || ft.includes('assisted_living') || ft.includes('residential')) typeKey = 'care_home'
    else if (ft.includes('training')) typeKey = 'training_agency'
    else if (ft.includes('hospital') || ft.includes('clinical')) typeKey = 'hospital'

    // Format registration & validity dates
    const registeredDate = facility.registered_at || facility.created_at || new Date().toISOString()
    const regYear = new Date(registeredDate).getFullYear()
    const duration = `12 Months (${regYear} - ${regYear + 1})`

    const certData: PremiumCertificateData = {
      certificateNumber: certCode,
      recipientName: facility.name || 'Member Facility',
      recipientSubtitle: facility.facility_type ? `${facility.facility_type.replace('_', ' ').toUpperCase()} MEMBER` : 'CERTIFIED FACILITY',
      facilityType: facility.facility_type ? facility.facility_type.replace('_', ' ').toUpperCase() : 'MEMBER FACILITY',
      facilityTypeKey: typeKey,
      category: 'facility_membership',
      issueDate: registeredDate,
      validUntil: new Date(new Date(registeredDate).setFullYear(new Date(registeredDate).getFullYear() + 1)).toISOString(),
      duration,
      verificationUrl,
      studentIdOrRegNumber: facility.registration_number || facility.institution_code || `FAC-${facility.id.substring(0, 6)}`,
      signatoryName: 'Olatunji Joel',
      signatoryTitle: 'Executive Director, Programmes',
    }

    return {
      success: true,
      facility,
      certificate: certData,
    }
  } catch (err: any) {
    console.error("Error in getFacilityCertificateDetails:", err)
    return { error: err.message || "Failed to load facility certificate details" }
  }
}
