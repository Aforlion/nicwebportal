'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function assignFacilityIdAction(facilityId: string) {
  await requireAdmin()

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Fetch facility first to select the correct prefix based on institutional category
    const { data: facility, error: fetchError } = await supabase
      .from('facilities')
      .select('facility_type, registration_number')
      .eq('id', facilityId)
      .single()

    if (fetchError || !facility) {
      return { success: false, error: 'Facility not found' }
    }

    // Determine category-specific prefix
    let prefix = 'FAC'
    if (facility.facility_type === 'training_agency') {
      prefix = 'TRN'
    } else if (facility.facility_type === 'agency') {
      prefix = 'AGY'
    }

    // Generate Standardized ID: NIC/[FAC|TRN|AGY]/YEAR/RANDOM
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    const registration_number = `NIC/${prefix}/${year}/${random}`

    // Update facilities table
    const { error } = await supabase
      .from('facilities')
      .update({
        registration_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', facilityId)

    if (error) {
      console.error('Error assigning Facility ID:', error)
      return { success: false, error: `Failed to assign Facility ID: ${error.message}` }
    }

    // Log action in audit trail
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('registry_actions').insert({
      target_type: 'facility',
      target_id: facilityId,
      action_type: 'assign_id',
      reason: `Assigned standardized ID: ${registration_number}`,
      performed_by: user?.id
    })

    revalidatePath('/admin/registry/facilities')
    revalidatePath('/registry')
    revalidatePath('/verify')
    
    return { success: true, registration_number }
  } catch (err: any) {
    console.error('assignFacilityIdAction unexpected error:', err)
    return { success: false, error: err.message || 'Failed to assign Facility ID' }
  }
}
