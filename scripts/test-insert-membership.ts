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

async function testInsert() {
  const dummyUserId = '94d1db66-0969-4a09-ad87-9abc7b262c9e' // Yewande's ID
  
  console.log('Testing membership insert with paid_at...')
  
  const { error: error1 } = await supabase
    .from('memberships')
    .insert({
      user_id: dummyUserId,
      category: 'institutional',
      status: 'active',
      is_active: true,
      paid_at: new Date().toISOString(),
      last_payment_reference: 'test_ref_' + Date.now(),
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    })

  if (error1) {
    console.error('Insert with paid_at failed:', error1.message)
  } else {
    console.log('Insert with paid_at succeeded!')
  }

  console.log('\nTesting membership insert with last_payment_date...')
  const { error: error2 } = await supabase
    .from('memberships')
    .insert({
      user_id: dummyUserId,
      category: 'institutional',
      status: 'active',
      is_active: true,
      last_payment_date: new Date().toISOString(),
      last_payment_reference: 'test_ref_2_' + Date.now(),
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    })

  if (error2) {
    console.error('Insert with last_payment_date failed:', error2.message)
  } else {
    console.log('Insert with last_payment_date succeeded!')
  }
}

testInsert()
