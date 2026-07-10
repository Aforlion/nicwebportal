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

async function checkRecentRegistrations() {
  console.log('Fetching recent registrations...')
  const { data: regs, error } = await supabase
    .from('pending_registrations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching registrations:', error.message)
    return
  }

  console.log('Recent registrations details:')
  for (const reg of regs) {
    console.log(`Email: ${reg.email}`)
    console.log(`Type: ${reg.registration_type}`)
    console.log(`Status: ${reg.status}`)
    console.log(`Created At: ${reg.created_at}`)
    console.log(`Form Data keys:`, Object.keys(reg.form_data || {}))
    if (reg.form_data) {
      console.log(`- ownerEmail: ${reg.form_data.ownerEmail}`)
      console.log(`- ownerFullName: ${reg.form_data.ownerFullName}`)
      console.log(`- has password: ${!!reg.form_data.password}`)
    }
    console.log('-----------------------------------')
  }
}

checkRecentRegistrations()
