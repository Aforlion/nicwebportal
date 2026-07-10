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
  const email = 'vistingangelsnig@gmail.com'
  const newPassword = 'Vistingangelsnig@Vmaris12'

  console.log(`Searching for user with email: ${email}...`)
  
  // Get user by email using Admin API
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    console.error(`User with email ${email} not found in auth.users`)
    return
  }

  console.log(`User found: ID = ${user.id}. Setting new password...`)

  // Update password
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword, email_confirm: true }
  )

  if (updateError) {
    console.error('Error updating password:', updateError.message)
  } else {
    console.log(`Successfully updated password for ${email}!`)
    console.log('Update details:', JSON.stringify(updateData, null, 2))
  }
}

setPassword()
