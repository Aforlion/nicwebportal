import { createClient } from '@supabase/supabase-js'

const url = 'https://fyaeabdaxqrdosdksqwx.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzk5ODIsImV4cCI6MjA4Mzk1NTk4Mn0.POxoRZGE_07yqi4VSUBHksd-iybSx3ZClwYFv2WMRbg'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU'

const anonClient = createClient(url, anonKey)
const serviceClient = createClient(url, serviceKey)

async function testAll() {
  console.log('--- TESTING WITH SERVICE ROLE KEY ---')
  const tables = [
    'internship_locations',
    'internship_cohorts',
    'internship_enrollments',
    'kb_articles',
    'kb_versions',
    'kb_escalations',
    'kb_feedback'
  ]

  for (const t of tables) {
    const { data, error, count } = await serviceClient.from(t).select('*', { count: 'exact' })
    if (error) {
      console.log(`ServiceRole ❌ Table '${t}': ${error.message} (${error.code})`)
    } else {
      console.log(`ServiceRole ✅ Table '${t}': ${data?.length} rows found`)
    }
  }

  console.log('\n--- TESTING WITH ANON KEY (BROWSER SIMULATION) ---')
  for (const t of tables) {
    const { data, error } = await anonClient.from(t).select('*')
    if (error) {
      console.log(`Anon ❌ Table '${t}': ${error.message} (${error.code})`)
    } else {
      console.log(`Anon ✅ Table '${t}': ${data?.length} rows retrieved`)
    }
  }
}

testAll()
