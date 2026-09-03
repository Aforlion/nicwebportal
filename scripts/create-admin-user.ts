import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createAdmin() {
  const email = 'aforlion007@gmail.com'
  const password = 'TempAdmin123!@#'

  console.log(`Creating auth user for: ${email}...`)
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'super_admin',
      full_name: 'Olatunji Joel'
    }
  })

  if (error) {
    console.error('Failed to create auth user:', error.message)
  } else {
    console.log('Successfully created auth user for admin!', JSON.stringify(data, null, 2))
  }
}

createAdmin()
