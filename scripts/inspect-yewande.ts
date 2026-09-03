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

async function inspect(email: string) {
  console.log(`=== Inspecting data for: ${email} ===`)

  // 1. Check pending registrations
  const { data: pending } = await supabase
    .from('pending_registrations')
    .select('*')
    .eq('email', email)
  console.log('\n--- pending_registrations ---')
  console.log(JSON.stringify(pending, null, 2))

  // 2. Check profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
  console.log('\n--- profiles ---')
  console.log(JSON.stringify(profile, null, 2))

  const userId = profile && profile.length > 0 ? profile[0].id : null

  // 2.5 Check auth users using admin client
  const { data: usersData } = await supabase.auth.admin.listUsers()
  const authUser = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
  console.log('\n--- auth.users ---')
  console.log(JSON.stringify(authUser, null, 2))

  // 3. Check memberships
  const { data: memberships } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
  console.log('\n--- memberships ---')
  console.log(JSON.stringify(memberships, null, 2))

  // 4. Check facilities owned
  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .eq('owner_id', userId)
  console.log('\n--- facilities owned ---')
  console.log(JSON.stringify(facilities, null, 2))
}

inspect('wanduslove2015@gmail.com')
