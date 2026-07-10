import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function makeSuperAdmin(email: string) {
  console.log(`Upgrading ${email} to super_admin...`)

  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('email', email)
    .single()

  if (findError) {
    console.error(`Could not find profile for ${email}:`, findError.message)
    return
  }

  console.log(`Found profile: ${profile.full_name} (Current Role: ${profile.role})`)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', profile.id)

  if (updateError) {
    console.error(`Error updating role:`, updateError.message)
  } else {
    console.log(`Successfully upgraded ${email} to super_admin!`)
  }
}

makeSuperAdmin('aforlion007@gmail.com')
