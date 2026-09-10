import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const publicClient = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const superAdminId = '371fa39b-3a62-4afa-af31-30cc49645a48'
  const email = 'aforlion007@gmail.com'
  const password = 'Aforlion007@NIC2026!'

  console.log(`Setting password for ${email} (${superAdminId})...`)

  const { data, error } = await adminClient.auth.admin.updateUserById(superAdminId, {
    password: password,
    email_confirm: true,
    user_metadata: { role: 'super_admin' }
  })

  if (error) {
    console.error('Error setting superadmin password:', error.message)
    return
  }

  console.log('Password updated successfully for', email)

  // Verify login with public client
  const { data: loginData, error: loginErr } = await publicClient.auth.signInWithPassword({
    email,
    password
  })

  if (loginErr) {
    console.error('❌ Sign In failed:', loginErr.message)
  } else {
    console.log('✅ Sign In SUCCESSFUL! User ID:', loginData.user.id)
  }
}

run().catch(console.error)
