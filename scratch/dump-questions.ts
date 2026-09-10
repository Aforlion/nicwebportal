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
  const brokenIds = [
    "0c22332f-c0c9-4732-b7c1-1fe4944e6067",
    "e84b7046-db83-4bad-b35a-07bf02519d98",
    "ade75c5e-d626-4b1e-8426-99fd67ad4292",
    "6b2eee8e-4d8a-40b5-badd-66f5afce395a",
    "f815dd50-2e3c-4bcd-b435-55697295d429",
    "5701253b-f882-413e-ac57-9ef1b675af0e"
  ]

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .in('id', brokenIds)

  if (!assessments) return

  for (const ass of assessments) {
    console.log(`=== ${ass.title} ===`)
    ass.questions.forEach((q: any, idx: number) => {
      console.log(`${idx + 1}. ${q.question || q.text}`)
      q.options.forEach((opt: string, oIdx: number) => {
        console.log(`   ${String.fromCharCode(97 + oIdx)}) ${opt}`)
      })
    })
    console.log('\n')
  }
}

run()
