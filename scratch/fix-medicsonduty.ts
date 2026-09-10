import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixMedicsOnDuty() {
  const userId = 'c2d02743-ba1b-498b-beb1-312205f75d16'
  const newEmail = 'themedicsonduty@gmail.com'
  const newPassword = 'Medics@NIC2026!'

  console.log(`Updating user ${userId} to email: ${newEmail}...`)

  // 1. Update Auth user email, password, role & metadata
  const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      email: newEmail,
      password: newPassword,
      email_confirm: true,
      user_metadata: {
        role: 'facility_admin',
        email: newEmail,
        full_name: 'Medics on Duty Limited'
      }
    }
  )

  if (authError) {
    console.error('Error updating auth user:', authError.message)
    return
  }
  console.log('Auth user updated successfully!')

  // 2. Update Profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      email: newEmail,
      role: 'facility_admin'
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating profile:', profileError.message)
  } else {
    console.log('Profile updated successfully!')
  }

  // 3. Verify facility owner alignment
  const { data: facility, error: facError } = await supabase
    .from('facilities')
    .select('*')
    .eq('owner_id', userId)
    .single()

  if (facError) {
    console.error('Error fetching facility:', facError.message)
  } else {
    console.log('Facility confirmed for user:')
    console.log(`- Facility Name: ${facility.name}`)
    console.log(`- Reg Number: ${facility.registration_number}`)
    console.log(`- Contact Email: ${facility.email}`)
  }

  console.log(`\n=== Account Fix Complete ===`)
  console.log(`Email: ${newEmail}`)
  console.log(`Password: ${newPassword}`)
}

fixMedicsOnDuty()
