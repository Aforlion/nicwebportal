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

const UPDATES = [
  {
    id: "db453b68-c5d7-4350-948f-0cdb9371a92c",
    name: "MEDICARE LIMITED",
    facility_type: "nursing_home",
    registration_number: "NIC/FAC/2026/9GUKF",
    institution_code: "NIC/FAC/2026/9GUKF"
  },
  {
    id: "283b3862-9ca6-4436-a75f-876c7bace0e0",
    name: "CARING HEARTS GLOBAL LIMITED",
    facility_type: "training_agency",
    registration_number: "NIC/TRN/2026/JB4LC",
    institution_code: "NIC/TRN/2026/JB4LC"
  },
  {
    id: "7c2fb737-1947-4d6f-b0e6-de2bcb4cb631",
    name: "Visting angels Nigeria LTD",
    facility_type: "training_agency",
    registration_number: "NIC/TRN/2026/QD4LP",
    institution_code: "NIC/TRN/2026/QD4LP"
  },
  {
    id: "d2c37ddb-fcee-4bd8-90be-4aaa7a95de92",
    name: "MyKin Care Agency",
    facility_type: "agency",
    registration_number: "NIC/AGY/2026/VJMZJ",
    institution_code: "NIC/AGY/2026/VJMZJ"
  },
  {
    id: "bd6a3f9a-8261-4fd2-ade2-4293e466a6ef",
    name: "INTERNATIONAL COLLEGE OF CAREGIVERS AND HEALTHCARE PRACTITIONERS LTD",
    facility_type: "training_agency",
    registration_number: "NIC/TRN/2026/L8E6K",
    institution_code: "NIC/TRN/2026/L8E6K"
  },
  {
    id: "d397c4a8-f5d8-44e8-87b0-7764a2d1b2fd",
    name: "ILEWA CARE LIMITED",
    facility_type: "agency",
    registration_number: "NIC/AGY/2026/AE7HO",
    institution_code: "NIC/AGY/2026/AE7HO"
  },
  {
    id: "826183fe-fa11-44a0-8255-9e4dc4b16b6f",
    name: "Divine Mother Inclusive Academy",
    facility_type: "training_agency",
    registration_number: "NIC/TRN/2026/U5OLO",
    institution_code: "NIC/TRN/2026/U5OLO"
  },
  {
    id: "e1edce1d-1cd5-4c43-ab32-4c0a4357bd63",
    name: "Medics on Duty Limited",
    facility_type: "training_agency",
    registration_number: "NIC/TRN/2026/FN2VO",
    institution_code: "NIC/TRN/2026/FN2VO"
  },
  {
    id: "e939bf86-82e5-4b7f-88d8-e786fb06a4c4",
    name: "Caring Homes",
    facility_type: "rehab",
    registration_number: "NIC/FAC/2026/7NOHN",
    institution_code: "NIC/FAC/2026/7NOHN"
  }
]

async function applyUpdates() {
  console.log('=== Updating All Facilities & Institution Codes ===')
  for (const item of UPDATES) {
    const { error } = await supabase
      .from('facilities')
      .update({
        facility_type: item.facility_type,
        registration_number: item.registration_number,
        institution_code: item.institution_code
      })
      .eq('id', item.id)

    if (error) {
      console.error(`Failed to update ${item.name}:`, error.message)
    } else {
      console.log(`[SUCCESS] Updated ${item.name}: type = ${item.facility_type}, code = ${item.institution_code}`)
    }
  }

  // Fetch updated list to confirm
  const { data: updated } = await supabase
    .from('facilities')
    .select('name, facility_type, registration_number, institution_code')

  console.log('\n=== Final Verified Facilities in DB ===')
  console.log(JSON.stringify(updated, null, 2))
}

applyUpdates()
