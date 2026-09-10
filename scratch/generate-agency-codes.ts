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

function generateCode(type: string, index: number): string {
  const year = new Date().getFullYear()
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  const numStr = String(index + 1).padStart(3, '0')

  if (type === 'agency') {
    return `NIC/AGY/${year}/${numStr}${randomSuffix}`
  } else if (type === 'training_agency' || type === 'training_institution') {
    return `NIC/TRN/${year}/${numStr}${randomSuffix}`
  } else {
    return `NIC/FAC/${year}/${numStr}${randomSuffix}`
  }
}

async function assignAgencyCodes() {
  console.log('=== Checking facilities for missing institution_code ===')

  const { data: facilities, error } = await supabase
    .from('facilities')
    .select('id, name, facility_type, registration_number, institution_code')

  if (error) {
    console.error('Error fetching facilities:', error.message)
    return
  }

  console.log(`Total facilities in DB: ${facilities?.length || 0}`)

  let index = 0
  for (const fac of facilities || []) {
    if (!fac.institution_code) {
      // If registration_number already looks like an NIC code, use it or generate a clean code
      let newCode = fac.registration_number?.startsWith('NIC/') ? fac.registration_number : generateCode(fac.facility_type, index)
      
      // Update facility record with institution_code
      const { error: updateError } = await supabase
        .from('facilities')
        .update({ institution_code: newCode })
        .eq('id', fac.id)

      if (updateError) {
        console.error(`Failed to assign code to ${fac.name}:`, updateError.message)
      } else {
        console.log(`Assigned institution_code '${newCode}' to ${fac.name} (${fac.facility_type})`)
      }
      index++
    } else {
      console.log(`Facility '${fac.name}' already has code: ${fac.institution_code}`)
    }
  }
}

assignAgencyCodes()
