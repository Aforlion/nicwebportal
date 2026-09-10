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
  const targetEmail = 'medicare4uall@gmail.com'
  const newPassword = 'Medicare@NIC2026!'
  const userId = '62e0dbe2-d5f4-4a78-8ca5-a12c772d9af6'

  console.log(`=== Complete Fix for ${targetEmail} (ID: ${userId}) ===`)

  // 1. Update Auth user password, email_confirm, user_metadata
  console.log('1. Updating Supabase Auth User...')
  const { data: authUser, error: authErr } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Medicare Limited',
      role: 'facility_admin'
    }
  })

  if (authErr) {
    console.error('Auth User Update Failed:', authErr.message)
  } else {
    console.log('Auth User Updated Successfully:', authUser.user.email)
  }

  // 2. Update profiles table
  console.log('2. Updating Profile Record...')
  const { data: profileData, error: profileErr } = await adminClient
    .from('profiles')
    .update({
      role: 'facility_admin',
      full_name: 'Medicare Limited',
      email: targetEmail,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()

  if (profileErr) {
    console.error('Profile Update Failed:', profileErr.message)
  } else {
    console.log('Profile Updated Successfully:', profileData)
  }

  // 3. Update facilities table
  console.log('3. Updating Facility Link...')
  const { data: facData, error: facErr } = await adminClient
    .from('facilities')
    .update({
      owner_id: userId,
      email: targetEmail,
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', 'db453b68-c5d7-4350-948f-0cdb9371a92c')
    .select()

  if (facErr) {
    console.error('Facility Update Failed:', facErr.message)
  } else {
    console.log('Facility Updated Successfully:', facData?.[0]?.name)
  }

  // 4. Update memberships table
  console.log('4. Updating Membership Record...')
  const { data: memData, error: memErr } = await adminClient
    .from('memberships')
    .update({
      category: 'corporate',
      status: 'active',
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()

  if (memErr) {
    console.error('Membership Update Failed:', memErr.message)
  } else {
    console.log('Membership Updated Successfully:', memData)
  }

  // 5. Verify Authentication with public client
  console.log('\n=== Verifying Authentication ===')
  const { data: signInData, error: signInErr } = await publicClient.auth.signInWithPassword({
    email: targetEmail,
    password: newPassword
  })

  if (signInErr) {
    console.error('❌ Sign In Test FAILED:', signInErr.message)
  } else {
    console.log('✅ Sign In Test SUCCESSFUL!')
    console.log('   User ID:', signInData.user.id)
    console.log('   Email:', signInData.user.email)
  }

  // 6. Verify with uppercase / whitespace email test
  console.log('\n=== Verifying Trimming/Lowercasing Test ===')
  const { data: signInData2, error: signInErr2 } = await publicClient.auth.signInWithPassword({
    email: `  ${targetEmail.toUpperCase()}  `.trim().toLowerCase(),
    password: newPassword
  })

  if (signInErr2) {
    console.error('❌ Trimmed/Lowercased Sign In FAILED:', signInErr2.message)
  } else {
    console.log('✅ Trimmed/Lowercased Sign In SUCCESSFUL!')
  }
}

run().catch(console.error)
