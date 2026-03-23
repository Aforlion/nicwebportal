'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function assignNicIdAction(membershipId: string) {
  await requireAdmin()

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Generate NIC ID
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    const nic_id = `NIC/MEM/${year}/${random}`

    // Update memberships table
    const { error } = await supabase
      .from('memberships')
      .update({
        nic_id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', membershipId)

    if (error) {
      console.error('Error assigning NIC ID:', error)
      return { success: false, error: `Failed to assign NIC ID: ${error.message}` }
    }

    revalidatePath('/admin/members')
    return { success: true, nic_id }
  } catch (err: any) {
    console.error('assignNicIdAction unexpected error:', err)
    return { success: false, error: err.message || 'Failed to assign NIC ID' }
  }
}
