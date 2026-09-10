import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
  const { data } = await supabase
    .from('assessments')
    .select('questions')
    .eq('id', 'ade75c5e-d626-4b1e-8426-99fd67ad4292')
    .single()
    
  console.log('Dementia Quiz Questions:', JSON.stringify(data?.questions, null, 2))
}

run()
