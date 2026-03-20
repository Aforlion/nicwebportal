import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestAccount(name: string, email: string, category: string, role: string = 'member') {
  console.log(`Creating account for ${name} (${email}) as ${category}...`)

  const password = 'Password123!'
  
  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name }
  })

  if (authError) {
    console.error(`Error creating auth user for ${email}:`, authError.message)
    return
  }

  const userId = authData.user.id
  console.log(`User created with ID: ${userId}`)

  // 2. Update Profile Role (Trigger handles creation, but let's be sure)
  // The handle_new_user trigger sets role to 'student' by default usually, or based on metadata.
  // Let's force it to 'member' if needed.
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role, full_name: name })
    .eq('id', userId)

  if (profileError) {
    console.error(`Error updating profile for ${email}:`, profileError.message)
  }

  // 3. Create Membership
  const nicId = `NIC-${Math.floor(Math.random() * 900000) + 100000}`
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert({
      user_id: userId,
      nic_id: nicId,
      category,
      status: 'active',
      is_active: true,
      joined_date: new Date().toISOString(),
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    })

  if (membershipError) {
    console.error(`Error creating membership for ${email}:`, membershipError.message)
  } else {
    console.log(`Membership created: ${nicId}`)
  }

  return { email, password }
}

async function main() {
  const users = [
    { name: 'Olamide Adigun', email: 'olamide.adigun@nic.org.ng', category: 'associate' },
    { name: 'Tope Stephen', email: 'tope.stephen@nic.org.ng', category: 'professional' }
  ]

  const results = []
  for (const user of users) {
    const result = await createTestAccount(user.name, user.email, user.category)
    if (result) results.push(result)
  }

  console.log('\n--- TEST ACCOUNTS CREATED ---')
  results.forEach(u => {
    console.log(`User: ${u.email}`)
    console.log(`Password: ${u.password}`)
    console.log('---------------------------')
  })
}

main()
