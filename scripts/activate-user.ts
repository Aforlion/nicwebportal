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

async function activateUser() {
  const email = 'igboamaka958@gmail.com'

  console.log(`Finding user profile for: ${email}...`)
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('email', email)
    .single()

  if (pError || !profile) {
    console.error('Profile not found:', pError?.message)
    return
  }

  console.log(`Found profile: ${profile.full_name} (${profile.id}). Updating membership to active...`)

  const { data: membership, error: mError } = await supabase
    .from('memberships')
    .update({
      is_active: true,
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', profile.id)
    .select()

  if (mError) {
    console.error('Error updating membership:', mError.message)
    return
  }

  console.log('Membership updated successfully:', JSON.stringify(membership, null, 2))
}

activateUser()
