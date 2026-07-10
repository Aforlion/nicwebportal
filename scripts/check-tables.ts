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

async function checkTables() {
  const { count: programsCount, error: pError } = await supabase
    .from('programs')
    .select('*', { count: 'exact', head: true })
  
  const { count: coursesCount, error: cError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  console.log(`Programs count: ${programsCount} (Error: ${pError?.message})`)
  console.log(`Courses count: ${coursesCount} (Error: ${cError?.message})`)

  // Check columns of programs
  const { data: programs } = await supabase.from('programs').select('*').limit(2)
  console.log('Programs sample:', JSON.stringify(programs, null, 2))

  // Check columns of courses
  const { data: courses } = await supabase.from('courses').select('*').limit(2)
  console.log('Courses sample:', JSON.stringify(courses, null, 2))
}

checkTables()
