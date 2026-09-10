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

async function run() {
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*, lessons(title, module_id, modules(course_id, courses(title)))')
    
  if (!assessments) return

  const brokenIds = [
    "0c22332f-c0c9-4732-b7c1-1fe4944e6067",
    "e84b7046-db83-4bad-b35a-07bf02519d98",
    "ade75c5e-d626-4b1e-8426-99fd67ad4292",
    "6b2eee8e-4d8a-40b5-badd-66f5afce395a",
    "f815dd50-2e3c-4bcd-b435-55697295d429",
    "5701253b-f882-413e-ac57-9ef1b675af0e",
    "160f10de-c678-4159-bde7-84a8bba4e72a",
    "abf1f5fa-4894-4b2f-a8a6-32b14c4ab6fb",
    "e3c46bf5-6227-4f2b-9eb6-e1b4cc03f07f",
    "c720d5c5-7294-46b3-b350-fb31d53ef7da",
    "290f5009-d4e4-4e11-8631-591f2ecdb3a0",
    "5745b57e-13f2-4340-a93e-533b9ace8a4e",
    "6d404757-a74b-401e-9326-ddde6835214c",
    "d74b91e3-d3bf-43d3-835f-6de28778c09f",
    "e3f3e06b-f230-4b0a-a7f6-cbf485d37367",
    "1ef1bbe2-96fd-4f92-8aed-779d75ff51b5"
  ]

  const brokenAssessments = assessments.filter(a => brokenIds.includes(a.id))
  
  for (const ass of brokenAssessments) {
    console.log(`=== Assessment: "${ass.title}" (ID: ${ass.id}) ===`)
    console.log('Number of questions:', ass.questions?.length)
    if (ass.questions && ass.questions.length > 0) {
      console.log('First Question:', JSON.stringify(ass.questions[0], null, 2))
    }
    console.log('\n')
  }
}

run()
