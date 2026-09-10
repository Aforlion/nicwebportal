import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { checkTrainingCenterDiscount } from '../src/lib/discounts'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const medicareUserId = '62e0dbe2-d5f4-4a78-8ca5-a12c772d9af6'
  const testCoursePrice = 20000

  console.log('=== Testing Training Center 25% Discount logic for Medicare Limited ===')

  const result = await checkTrainingCenterDiscount(supabase, medicareUserId, testCoursePrice)

  console.log('Discount Result for Medicare Limited:', result)

  if (result.isTrainingCenter && result.discountPercent === 25 && result.finalPrice === 15000) {
    console.log('✅ DISCOUNT TEST PASSED! 25% discount successfully calculated.')
  } else {
    console.error('❌ DISCOUNT TEST FAILED!')
  }
}

run().catch(console.error)
