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

async function inspectAllFacilities() {
  const { data: facilities, error } = await supabase
    .from('facilities')
    .select('id, name, email, facility_type, registration_number, institution_code, owner_id')

  if (error) {
    console.error('Error fetching facilities:', error.message)
    return
  }

  console.log('=== Current Facilities in Database ===')
  console.log(JSON.stringify(facilities, null, 2))
}

inspectAllFacilities()
