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
  console.log(`=== Investigating user: ${targetEmail} ===`)

  // 1. Fetch profiles table by email
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', targetEmail)

  console.log('Profiles search result:', { profiles, pError })

  // 2. Fetch all pages of Auth users to find medicare4uall@gmail.com
  let page = 1
  let foundUser: any = null
  let totalUsersCount = 0

  while (true) {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000
    })

    if (listError) {
      console.error('Error listing users page', page, listError.message)
      break
    }

    const users = usersData?.users || []
    totalUsersCount += users.length

    const match = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())
    if (match) {
      foundUser = match
      break
    }

    if (users.length < 1000) {
      break
    }
    page++
  }

  console.log(`Scanned ${totalUsersCount} auth users across ${page} page(s).`)

  if (foundUser) {
    console.log('FOUND AUTH USER:', {
      id: foundUser.id,
      email: foundUser.email,
      confirmed_at: foundUser.email_confirmed_at,
      last_sign_in_at: foundUser.last_sign_in_at,
      created_at: foundUser.created_at,
      user_metadata: foundUser.user_metadata,
      app_metadata: foundUser.app_metadata,
      banned_until: foundUser.banned_until
    })
  } else {
    console.log('AUTH USER NOT FOUND IN SUPABASE AUTH!')
  }

  // 3. Search facilities table
  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .or(`email.ilike.%${targetEmail}%,name.ilike.%medicare%`)

  console.log('Facilities match:', facilities)

  // 4. Search memberships table if user found or profiles found
  if (foundUser || (profiles && profiles.length > 0)) {
    const userIds = [foundUser?.id, ...(profiles || []).map(p => p.id)].filter(Boolean)
    const { data: mems } = await supabase
      .from('memberships')
      .select('*')
      .in('user_id', userIds)

    console.log('Memberships match:', mems)
  }
}

run().catch(console.error)
