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

async function checkOwner() {
  const ownerId = 'c2d02743-ba1b-498b-beb1-312205f75d16'
  console.log(`=== Checking Owner ID: ${ownerId} ===`)

  // Check auth.users by ID
  const { data: { user }, error: uError } = await supabase.auth.admin.getUserById(ownerId)
  if (uError) {
    console.error('Error fetching auth user by ID:', uError.message)
  } else if (user) {
    console.log('Auth user found:')
    console.log(`- ID: ${user.id}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- Metadata:`, JSON.stringify(user.user_metadata, null, 2))
  } else {
    console.log('No auth user found with that ID')
  }

  // Check profiles by ID
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', ownerId)
    .single()

  if (pError) {
    console.error('Error fetching profile:', pError.message)
  } else {
    console.log('Profile found:')
    console.log(JSON.stringify(profile, null, 2))
  }
}

checkOwner()
