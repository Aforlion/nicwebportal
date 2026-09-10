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

async function run() {
  const email = 'medicare4uall@gmail.com'
  const password = 'Medicare@NIC2026!'

  console.log(`Testing signInWithPassword for ${email} with password: ${password}`)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('LOGIN ERROR:', error.status, error.name, error.message)
  } else {
    console.log('LOGIN SUCCESS! User ID:', data.user.id, 'Email:', data.user.email)
  }
}

run().catch(console.error)
