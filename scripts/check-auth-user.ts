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

async function checkAuthUser(email: string) {
  console.log(`Checking auth user: ${email}...`)
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('Error listing users:', error.message)
    return
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.log(`No user found in auth.users with email: ${email}`)
    return
  }

  console.log('User found in auth.users:')
  console.log(`- ID: ${user.id}`)
  console.log(`- Email: ${user.email}`)
  console.log(`- Role (metadata): ${user.user_metadata?.role}`)
  console.log(`- Full Name (metadata): ${user.user_metadata?.full_name}`)
  console.log(`- Confirmed At: ${user.confirmed_at}`)
  console.log(`- Last Sign In: ${user.last_sign_in_at}`)
  console.log(`- Email Confirmed: ${user.email_confirmed_at}`)

  // Also query the profiles table
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (pError) {
    console.error('Error fetching profile from public.profiles:', pError.message)
  } else {
    console.log('Profile found in public.profiles:')
    console.log(JSON.stringify(profile, null, 2))
  }
}

checkAuthUser('vistingangelsnig@gmail.com')
