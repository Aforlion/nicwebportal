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

async function checkUser() {
  console.log('=== Searching for user Machima or Irene ===')

  // 1. Search profiles
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .or('full_name.ilike.%machima%,full_name.ilike.%irene%,email.ilike.%machima%')

  console.log('Profiles found:', profiles)

  if (profiles && profiles.length > 0) {
    for (const p of profiles) {
      console.log(`Checking memberships for user_id ${p.id} (${p.full_name}, ${p.email}):`)
      const { data: mems, error: mErr } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', p.id)

      console.log('Memberships:', mems)
    }
  }

  // Also check all users without memberships
  const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, email, role')
  console.log(`Total profiles: ${allProfiles?.length}`)

  for (const prof of allProfiles || []) {
    const { data: m } = await supabase.from('memberships').select('id').eq('user_id', prof.id).maybeSingle()
    if (!m) {
      console.log(`[NO MEMBERSHIP RECORD] User ${prof.id} | ${prof.full_name} | ${prof.email} | role: ${prof.role}`)
    }
  }
}

checkUser()
