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

async function findAdmin() {
  console.log('Querying for admin/super_admin profiles...')
  const { data, error } = await supabase
    .from('profiles')
    .select('email, role')
    .in('role', ['admin', 'super_admin'])

  if (error) {
    console.error('Error fetching admins:', error.message)
    return
  }

  console.log('Admin profiles:', data)
}

findAdmin()
