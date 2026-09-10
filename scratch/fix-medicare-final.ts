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
  const targetUserId = '62e0dbe2-d5f4-4a78-8ca5-a12c772d9af6'

  // 1. Get super_admin profile ID
  const { data: saProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', superAdminEmail)
    .single()

  if (!saProfile) {
    console.error('Super admin profile not found')
    return
  }

  console.log(`1. Super admin ID: ${saProfile.id}. Setting temp password...`)
  const { error: saPassErr } = await adminClient.auth.admin.updateUserById(saProfile.id, {
    password: tempPassword,
    email_confirm: true
  })

  if (saPassErr) {
    console.error('Super admin password update error:', saPassErr.message)
    return
  }

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

  console.log('3. Updating Auth User metadata & password for medicare user...')
  await adminClient.auth.admin.updateUserById(targetUserId, {
    password: 'Medicare@NIC2026!',
    email_confirm: true,
    user_metadata: {
      full_name: 'Medicare Limited',
      role: 'facility_admin'
    }
  })

  console.log('4. Updating profile role to facility_admin via superadmin client...')
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

  console.log('5. Updating membership category to institutional & status active...')
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

  console.log('6. Verifying Medicare login via public client...')
  const publicClient = createClient(supabaseUrl, supabaseAnonKey)
  const { data: medicareLogin, error: medicareLoginErr } = await publicClient.auth.signInWithPassword({
    email: targetEmail,
    password: 'Medicare@NIC2026!'
  })

  if (medicareLoginErr) {
    console.error('❌ Medicare login test failed:', medicareLoginErr.message)
  } else {
    console.log('✅ Medicare login test SUCCESSFUL! User ID:', medicareLogin.user.id)
  }
}

run().catch(console.error)
