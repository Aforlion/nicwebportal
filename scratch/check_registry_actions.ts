import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
  const { data } = await supabase.from('registry_actions').select('*').limit(1).single()
  console.log('registry_actions columns:', Object.keys(data || {}))
}

check().catch(console.error)
