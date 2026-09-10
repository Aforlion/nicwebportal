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

async function inspectUser() {
  const targetEmail = 'themedicsonduty@gmail.com'
  console.log(`=== Inspecting user: ${targetEmail} ===`)

  // 1. Search in auth.users
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  const user = usersData.users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())

  if (!user) {
    console.log(`[AUTH] User NOT found in auth.users matching '${targetEmail}'`)
    
    // Search similar emails
    const similar = usersData.users.filter(u => u.email?.toLowerCase().includes('medic') || u.email?.toLowerCase().includes('duty'))
    console.log('Similar auth emails found:', similar.map(u => ({ id: u.id, email: u.email })))
  } else {
    console.log('[AUTH] User found in auth.users:')
    console.log({
      id: user.id,
      email: user.email,
      confirmed_at: user.confirmed_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
      created_at: user.created_at
    })
  }

  // 2. Search in public.profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', `%${targetEmail}%`)

  console.log(`[PROFILES] Found ${profiles?.length || 0} matching profile(s):`)
  if (profiles && profiles.length > 0) {
    console.log(JSON.stringify(profiles, null, 2))
  }

  // 3. Search in public.memberships
  const { data: memberships } = await supabase
    .from('memberships')
    .select('*')
    .ilike('email', `%${targetEmail}%`)

  console.log(`[MEMBERSHIPS] Found ${memberships?.length || 0} matching membership(s):`)
  if (memberships && memberships.length > 0) {
    console.log(JSON.stringify(memberships, null, 2))
  }

  // 4. Search in public.facilities
  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .ilike('email', `%${targetEmail}%`)

  console.log(`[FACILITIES] Found ${facilities?.length || 0} matching facility(ies):`)
  if (facilities && facilities.length > 0) {
    console.log(JSON.stringify(facilities, null, 2))
  }
}

inspectUser()
