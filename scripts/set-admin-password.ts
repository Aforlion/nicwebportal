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

async function setPassword() {
  const email = 'aforlion007@gmail.com'
  const newPassword = 'Aforlion007@NIC2026!'

  console.log(`Setting password for super_admin: ${email}...`)
  
  // Get user by email with pagination
  let user = null
  let page = 1
  while (true) {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
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
    user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (user) {
      break
    }
    page++
  }

  if (!user) {
    console.error(`User with email ${email} not found in auth.users`)
    return
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  })

  if (updateError) {
    console.error('Error updating password:', updateError.message)
  } else {
    console.log(`Successfully updated password for ${email} to: ${newPassword}`)
  }
}

setPassword()
