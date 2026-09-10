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

async function run() {
  const superAdminEmail = 'aforlion007@gmail.com'
  const tempPassword = 'TempAdmin123!@#'
  const targetEmail = 'medicare4uall@gmail.com'

  console.log(`1. Ensuring super_admin (${superAdminEmail}) password...`)
  
  const { data: usersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
  const superAdminUser = usersData?.users?.find(u => u.email?.toLowerCase() === superAdminEmail.toLowerCase())

  if (!superAdminUser) {
    console.error('Super admin user not found')
    return
  }

  await adminClient.auth.admin.updateUserById(superAdminUser.id, {
    password: tempPassword,
    email_confirm: true
  })

  console.log('2. Signing in as super_admin...')
  const userClient = createClient(supabaseUrl, supabaseAnonKey)
  const { data: authData, error: signInError } = await userClient.auth.signInWithPassword({
    email: superAdminEmail,
    password: tempPassword
  })

  if (signInError || !authData.session) {
    console.error('Super admin sign in failed:', signInError?.message)
    return
  }

  const superClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    }
  })

  console.log(`3. Updating target profile (${targetEmail}) role to facility_admin...`)
  const targetUserId = '62e0dbe2-d5f4-4a78-8ca5-a12c772d9af6'

  // Also update auth user metadata
  await adminClient.auth.admin.updateUserById(targetUserId, {
    user_metadata: {
      full_name: 'Medicare Limited',
      role: 'facility_admin'
    }
  })

  const { data: profileResult, error: profileError } = await superClient
    .from('profiles')
    .update({ role: 'facility_admin' })
    .eq('id', targetUserId)
    .select()

  if (profileError) {
    console.error('Profile update error:', profileError.message)
  } else {
    console.log('Profile updated successfully:', profileResult)
  }

  console.log(`4. Updating membership category to institutional and status to active...`)
  const { data: memResult, error: memError } = await superClient
    .from('memberships')
    .update({
      category: 'institutional',
      status: 'active',
      is_active: true
    })
    .eq('user_id', targetUserId)
    .select()

  if (memError) {
    console.error('Membership update error:', memError.message)
  } else {
    console.log('Membership updated successfully:', memResult)
  }

  console.log('\n=== DONE ===')
}

run().catch(console.error)
