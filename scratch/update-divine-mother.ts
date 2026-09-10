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

async function updateFacility() {
  console.log('=== Searching for Divine Mother facility ===')

  // Search by ID or name
  const { data: facility, error: fetchErr } = await supabase
    .from('facilities')
    .select('*')
    .or('id.eq.826183fe-fa11-44a0-8255-9e4dc4b16b6f,name.ilike.%divine mother%')

  if (fetchErr) {
    console.error('Fetch error:', fetchErr)
    return
  }

  console.log('Found facilities:', facility)

  if (!facility || facility.length === 0) {
    console.error('No matching facility found')
    return
  }

  for (const fac of facility) {
    const newRegNum = fac.registration_number ? fac.registration_number.replace('AGY', 'TRN') : 'NIC/TRN/2026/U5OLO'
    const newInstCode = fac.institution_code ? fac.institution_code.replace('AGY', 'TRN') : 'NIC/TRN/2026/U5OLO'

    const { data: updated, error: updateErr } = await supabase
      .from('facilities')
      .update({
        name: 'Divine Mother Inclusive Academy',
        facility_type: 'training_agency',
        registration_number: newRegNum,
        institution_code: newInstCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', fac.id)
      .select('*')

    if (updateErr) {
      console.error(`Failed to update ${fac.name}:`, updateErr)
    } else {
      console.log(`[SUCCESS] Updated facility ${fac.id}:`, updated)
    }
  }
}

updateFacility()
