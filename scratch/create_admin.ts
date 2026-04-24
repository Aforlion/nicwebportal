import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing supabase envs")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  const email = "ayoasojo@gmail.com"
  const fullName = "Falowo-Asojo Ayobamidele"
  const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase() + "!"

  console.log(`Creating user ${email}...`)

  const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  })

  if (error) {
    if (error.message.includes('already been registered')) {
        console.log("User already exists in Auth. Looking up...")
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = users?.users.find(u => u.email === email)
        if (existingUser) {
           await updateProfile(existingUser.id, fullName)
        } else {
           console.error("User exists but could not find ID", listError)
        }
    } else {
        console.error("Error creating user:", error)
        process.exit(1)
    }
  } else if (user.user) {
    console.log("User created in Auth with ID:", user.user.id)
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for trigger to create profile
    await updateProfile(user.user.id, fullName)
  }
}

async function updateProfile(userId: string, fullName: string) {
    console.log(`Updating profile for ${userId} to be admin...`)
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin', full_name: fullName })
        .eq('id', userId)
        .select()
        .single()
        
    if (error) {
        console.error("Error updating profile role:", error)
    } else {
        console.log("Successfully updated profile:", profile)
    }
}

run()
