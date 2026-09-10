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

async function fixMissingMemberships() {
  console.log('=== Checking and Repairing All Missing Memberships ===')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')

  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }

  console.log(`Found ${profiles?.length || 0} total user profiles.`)

  let createdCount = 0

  for (const prof of profiles || []) {
    const { data: mem } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', prof.id)
      .maybeSingle()

    if (!mem) {
      console.log(`Creating missing membership for user: ${prof.full_name} (${prof.email}) [ID: ${prof.id}]...`)
      
      const year = new Date().getFullYear()
      const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
      const nicId = prof.role === 'student' ? `NIC/STU/${year}/${rand}` : `NIC/MEM/${year}/${rand}`

      let category = 'full'
      if (prof.role === 'student') category = 'student'
      else if (prof.role === 'facility_admin') category = 'corporate'

      const { data: inserted, error: insErr } = await supabase
        .from('memberships')
        .insert({
          user_id: prof.id,
          nic_id: nicId,
          category,
          status: 'active',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (insErr) {
        console.error(`Failed to create membership for ${prof.email}:`, insErr)
      } else {
        console.log(`[CREATED SUCCESS] Membership ID: ${inserted.id} (NIC ID: ${nicId}) for ${prof.email}`)
        createdCount++
      }
    }
  }

  console.log(`\n=== Repair Finished: Created ${createdCount} missing membership records. ===`)
}

fixMissingMemberships()
