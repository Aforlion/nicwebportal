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

async function run() {
  const targetEmail = 'medicare4uall@gmail.com'
  const newPassword = 'Medicare@NIC2026!'

  console.log(`=== Setting/Creating Login Password for ${targetEmail} ===`)

  // 1. Search for existing auth user
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  let user = usersData.users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())

  if (user) {
    console.log(`[FOUND USER] User ID: ${user.id}. Updating password...`)
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword, email_confirm: true }
    )

    if (updateError) {
      console.error('Failed to update password:', updateError.message)
      return
    }
    console.log(`[SUCCESS] Password updated for existing user ${targetEmail}`)
  } else {
    console.log(`User ${targetEmail} not found in Auth. Creating new user account...`)
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: newPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Medicare Limited' }
    })

    if (createError) {
      console.error('Failed to create user:', createError.message)
      return
    }

    user = createData.user
    console.log(`[SUCCESS] Created new Auth user ${targetEmail} with ID: ${user.id}`)
  }

  // 2. Ensure Profile exists in profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    console.log('Creating profile record for user...')
    await supabase.from('profiles').upsert({
      id: user.id,
      email: targetEmail,
      full_name: 'Medicare Limited',
      role: 'facility_admin',
      updated_at: new Date().toISOString()
    })
  }

  // 3. Ensure Facility is linked if Medicare exists
  const { data: facility } = await supabase
    .from('facilities')
    .select('*')
    .ilike('name', '%medicare%')
    .maybeSingle()

  if (facility) {
    console.log(`Linking facility ${facility.name} (ID: ${facility.id}) to owner ${user.id}...`)
    await supabase
      .from('facilities')
      .update({ owner_id: user.id, email: targetEmail })
      .eq('id', facility.id)
  }

  // 4. Ensure Membership exists
  const { data: mem } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!mem) {
    const year = new Date().getFullYear()
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
    const nicId = `NIC/FAC/${year}/${rand}`

    await supabase.from('memberships').insert({
      user_id: user.id,
      nic_id: nicId,
      category: 'corporate',
      status: 'active',
      is_active: true,
      created_at: new Date().toISOString()
    })
    console.log(`Created corporate membership record ${nicId}`)
  }

  console.log('\n=== DONE ===')
  console.log(`Email: ${targetEmail}`)
  console.log(`Password: ${newPassword}`)
}

run()
