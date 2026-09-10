import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  const email = 'medicare4uall@gmail.com'
  const userId = '62e0dbe2-d5f4-4a78-8ca5-a12c772d9af6'

  console.log(`=== Updating ${email} (Medicare Limited) to Training Center ===`)

  // 1. Update Facilities table
  const { data: facData, error: facErr } = await supabase
    .from('facilities')
    .update({
      facility_type: 'training_agency',
      registration_number: 'NIC/TRN/2026/9GUKF',
      institution_code: 'NIC/TRN/2026/9GUKF',
      curriculum_status: 'approved',
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('owner_id', userId)
    .select()

  if (facErr) {
    console.error('Facility update failed:', facErr.message)
  } else {
    console.log('✅ Facility updated successfully to Training Agency:', facData)
  }

  // 2. Update profiles table
  const { data: profData, error: profErr } = await supabase
    .from('profiles')
    .update({
      role: 'facility_admin',
      training_facility_id: facData?.[0]?.id || 'db453b68-c5d7-4350-948f-0cdb9371a92c',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()

  if (profErr) {
    console.error('Profile update failed:', profErr.message)
  } else {
    console.log('✅ Profile updated successfully:', profData)
  }

  // 3. Update Auth Metadata
  const { data: authData, error: authErr } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      full_name: 'Medicare Limited',
      role: 'facility_admin',
      facility_type: 'training_agency'
    }
  })

  if (authErr) {
    console.error('Auth metadata update failed:', authErr.message)
  } else {
    console.log('✅ Auth Metadata updated successfully:', authData.user.email)
  }

  console.log('=== Medicare Limited is now an Accredited NIC Training Center! ===')
}

run().catch(console.error)
