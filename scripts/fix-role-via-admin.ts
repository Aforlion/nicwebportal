import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

// 1. Create admin client to reset the super_admin's password
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  const adminEmail = 'aforlion007@gmail.com'
  const tempPassword = 'TempAdmin123!@#'

  console.log(`1. Finding super_admin user: ${adminEmail}...`)
  
  let superAdminUser = null
  let page = 1
  while (true) {
    console.log(`Fetching page ${page} of users...`)
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
      page: page,
      perPage: 100
    })
    
    if (listError) {
      console.error('Error listing users:', listError.message)
      return
    }
    
    if (!usersData.users || usersData.users.length === 0) {
      break
    }
    
    superAdminUser = usersData.users.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase())
    if (superAdminUser) {
      break
    }
    
    page++
  }

  if (!superAdminUser) {
    console.error(`Super admin ${adminEmail} not found.`)
    return
  }

  console.log(`2. Resetting password for super_admin (${adminEmail})...`)
  const { error: resetError } = await adminClient.auth.admin.updateUserById(superAdminUser.id, {
    password: tempPassword,
    email_confirm: true
  })
  if (resetError) {
    console.error('Failed to reset super_admin password:', resetError.message)
    return
  }
  console.log('Super_admin password reset successfully.')

  // 3. Create a user client and sign in as the super_admin
  console.log('3. Signing in as super_admin...')
  const userClient = createClient(supabaseUrl, supabaseServiceKey) // Using service key so it can access all schemas, but we will sign in
  const { data: authData, error: signInError } = await userClient.auth.signInWithPassword({
    email: adminEmail,
    password: tempPassword
  })

  if (signInError || !authData.session) {
    console.error('Failed to sign in as super_admin:', signInError?.message)
    return
  }

  console.log('Signed in successfully! Session acquired.')
  
  // Create a new client authenticated as the super_admin
  const authenticatedClient = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    }
  })

  const targetEmail = 'telldirector@live.com'
  console.log(`4. Fetching target profile for ${targetEmail}...`)
  const { data: targetProfile, error: targetError } = await authenticatedClient
    .from('profiles')
    .select('id, full_name')
    .eq('email', targetEmail)
    .single()

  if (targetError || !targetProfile) {
    console.error('Failed to find target profile:', targetError?.message)
    return
  }

  console.log(`Found target profile: ${targetProfile.full_name} (${targetProfile.id})`)

  console.log('5. Updating target profile role to facility_admin...')
  const { data: updatedProfile, error: updateError } = await authenticatedClient
    .from('profiles')
    .update({ role: 'facility_admin' })
    .eq('id', targetProfile.id)
    .select()

  if (updateError) {
    console.error('Failed to update profile role:', updateError.message)
  } else {
    console.log('Profile role updated successfully!', JSON.stringify(updatedProfile, null, 2))
  }

  console.log('6. Updating membership category to institutional...')
  const { data: updatedMembership, error: membershipError } = await authenticatedClient
    .from('memberships')
    .update({ category: 'institutional' })
    .eq('user_id', targetProfile.id)
    .select()

  if (membershipError) {
    console.error('Failed to update membership:', membershipError.message)
  } else {
    console.log('Membership updated successfully!', JSON.stringify(updatedMembership, null, 2))
  }
}

run()
