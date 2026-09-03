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

async function run() {
  const adminEmail = 'aforlion007@gmail.com'
  const tempPassword = 'TempAdmin123!@#'

  console.log(`1. Finding super_admin user: ${adminEmail}...`)
  
  let superAdminUser = null
  let page = 1
  while (true) {
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

  console.log(`2. Setting temporary password for super_admin...`)
  const { error: resetError } = await adminClient.auth.admin.updateUserById(superAdminUser.id, {
    password: tempPassword,
    email_confirm: true
  })
  if (resetError) {
    console.error('Failed to reset super_admin password:', resetError.message)
    return
  }

  console.log('3. Signing in as super_admin...')
  const userClient = createClient(supabaseUrl, supabaseServiceKey)
  const { data: authData, error: signInError } = await userClient.auth.signInWithPassword({
    email: adminEmail,
    password: tempPassword
  })

  if (signInError || !authData.session) {
    console.error('Failed to sign in as super_admin:', signInError?.message)
    return
  }

  console.log('Signed in successfully! Session acquired.')
  
  const authenticatedClient = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    }
  })

  const targetEmail = 'wanduslove2015@gmail.com'
  console.log(`4. Fetching target profile for ${targetEmail}...`)
  const { data: targetProfile, error: targetError } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .eq('email', targetEmail)
    .single()

  if (targetError || !targetProfile) {
    console.error('Failed to find target profile:', targetError?.message)
    return
  }

  console.log(`Found target profile: ${targetProfile.full_name} (${targetProfile.id})`)

  console.log('5. Updating profile role to facility_admin via authenticated super_admin client...')
  const { data: updatedProfile, error: updateError } = await authenticatedClient
    .from('profiles')
    .update({ role: 'facility_admin' })
    .eq('id', targetProfile.id)
    .select()

  if (updateError) {
    console.error('Failed to update profile role:', updateError.message)
    return
  }
  console.log('Profile role updated successfully!', JSON.stringify(updatedProfile, null, 2))

  console.log('6. Updating Auth metadata via adminClient...')
  const { error: authMetaError } = await adminClient.auth.admin.updateUserById(targetProfile.id, {
    user_metadata: { role: 'facility_admin' }
  })
  if (authMetaError) {
    console.error('Failed to update Auth metadata:', authMetaError.message)
  } else {
    console.log('Auth metadata role updated to facility_admin.')
  }

  console.log('7. Checking if membership record exists...')
  const { data: existingMembership } = await adminClient
    .from('memberships')
    .select('id')
    .eq('user_id', targetProfile.id)
    .maybeSingle()

  if (existingMembership) {
    console.log('Membership record exists. Updating category to institutional...')
    const { error: memUpdateError } = await adminClient
      .from('memberships')
      .update({ category: 'institutional' })
      .eq('id', existingMembership.id)
    
    if (memUpdateError) {
      console.error('Failed to update membership:', memUpdateError.message)
    } else {
      console.log('Membership updated to institutional.')
    }
  } else {
    console.log('No membership record exists. Creating new institutional membership...')
    const { error: memInsertError } = await adminClient
      .from('memberships')
      .insert({
        user_id: targetProfile.id,
        category: 'institutional',
        status: 'pending',
        is_active: false
      })
    
    if (memInsertError) {
      console.error('Failed to create membership:', memInsertError.message)
    } else {
      console.log('Membership record created successfully.')
    }
  }
}

run().catch(console.error)
