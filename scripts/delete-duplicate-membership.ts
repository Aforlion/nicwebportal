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

async function deleteExtraMembership() {
  const duplicateId = '8ff46ae6-86cc-4dae-b6e7-58cd4384565f'
  
  console.log(`Deleting duplicate membership with ID: ${duplicateId}...`)
  
  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('id', duplicateId)

  if (error) {
    console.error('Failed to delete duplicate:', error.message)
  } else {
    console.log('Successfully deleted duplicate test membership!')
  }
}

deleteExtraMembership()
