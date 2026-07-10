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

async function checkPayments() {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .limit(5)

  if (error) {
    console.error('Error fetching payments:', error.message)
    return
  }

  console.log(`Sample payments:`, JSON.stringify(payments, null, 2))

  // Let's also count how many payments there are in total, and their status values
  const { data: allPayments } = await supabase
    .from('payments')
    .select('status, created_at, amount')
  
  if (allPayments) {
    console.log(`Total payments in DB: ${allPayments.length}`)
    const statuses = allPayments.reduce((acc: any, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})
    console.log('Status counts:', statuses)
  }
}

checkPayments()
