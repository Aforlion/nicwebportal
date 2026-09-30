import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
  const { data: fac } = await supabase.from('facilities').select('*').eq('name', 'Divine Mother Inclusive Academy').single()
  console.log('Facility ID:', fac?.id)
  console.log('Facility Name:', fac?.name)
  console.log('Curriculum URL:', fac?.curriculum_url)
  console.log('Curriculum Status:', fac?.curriculum_status)
  console.log('Owner ID:', fac?.owner_id)

  if (fac?.owner_id) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', fac.owner_id).single()
    console.log('Owner:', prof?.full_name, prof?.email)

    const { data: mems } = await supabase.from('memberships').select('id, membership_type, status, documents(*)').eq('user_id', fac.owner_id)
    console.log('Memberships count:', mems?.length)
    if (mems) {
        for (const m of mems) {
            console.log(`- Membership ${m.id} (${m.membership_type}): ${m.documents?.length} documents`)
            for (const d of (m.documents as any[] || [])) {
                console.log(`  * ${d.document_name} (${d.status}): ${d.file_url}`)
            }
        }
    }
  }

  // Also check if any other files in storage for this facility
  const { data: files } = await supabase.storage.from('curriculum-documents').list(fac?.id)
  console.log(`Curriculum documents bucket files for ${fac?.id}:`, files?.length || 0)
}

run().catch(console.error)
