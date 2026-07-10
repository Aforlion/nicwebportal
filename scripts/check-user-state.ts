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

async function checkUserState() {
  const userId = '5ea55908-6915-44b4-a0e7-c6210fd85bb4'
  const email = 'vistingangelsnig@gmail.com'

  console.log(`Checking DB state for User ID: ${userId} (${email})`)

  // 1. Check Facilities
  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .eq('owner_id', userId)
  console.log('Facilities owned by user:', JSON.stringify(facilities, null, 2))

  // 2. Check Enrollments
  const { data: enrolls } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
  console.log('Enrollments for user:', JSON.stringify(enrolls, null, 2))

  // 3. Check Payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
  console.log(`Total payments in DB: ${payments?.length || 0}`)
  
  // Let's filter payments by membership IDs
  const { data: userMemberships } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', userId)
  
  if (userMemberships && userMemberships.length > 0) {
    const mIds = userMemberships.map(m => m.id)
    const { data: userPayments } = await supabase
      .from('payments')
      .select('*')
      .in('membership_id', mIds)
    console.log('Payments linked to user membership(s):', JSON.stringify(userPayments, null, 2))
  }
}

checkUserState()
