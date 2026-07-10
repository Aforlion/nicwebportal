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

async function checkMemberships(email: string) {
  console.log(`Checking memberships for: ${email}...`)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('email', email)
    .single()

  if (!profile) {
    console.log('No profile found')
    return
  }

  const { data: memberships, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', profile.id)

  if (error) {
    console.error('Error fetching memberships:', error.message)
    return
  }

  console.log(`Memberships found for ${profile.full_name} (${profile.id}):`)
  console.log(JSON.stringify(memberships, null, 2))
}

checkMemberships('vistingangelsnig@gmail.com')
