import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  const email = 'themedicsonduty@gmail.com'
  const password = 'Medics@NIC2026!'

  console.log(`Testing login for ${email}...`)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Login test FAILED:', error.message)
  } else {
    console.log('Login test SUCCESSFUL!')
    console.log(`User ID: ${data.user.id}`)
    console.log(`User Role: ${data.user.user_metadata?.role}`)
  }
}

testLogin()
