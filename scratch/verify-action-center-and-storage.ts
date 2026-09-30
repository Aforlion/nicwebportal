import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    console.log("=== Verification Check ===")

    // 1. Storage buckets check
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets()
    if (bErr) throw bErr
    console.log("\nStorage Buckets:")
    for (const b of buckets) {
        console.log(`- ${b.name} (public: ${b.public})`)
    }

    // 2. Accreditation applications check
    const { data: apps, error: aErr } = await supabase
        .from('accreditation_applications')
        .select('id, status, facility_id, created_at')
    if (aErr) throw aErr
    console.log(`\nAccreditation Applications in DB: ${apps.length}`)
    for (const a of apps) {
        console.log(`- Application ${a.id} | Facility: ${a.facility_id} | Status: ${a.status}`)
    }

    // 3. Facility curriculum status check
    const { data: facs, error: fErr } = await supabase
        .from('facilities')
        .select('id, name, curriculum_status, curriculum_url')
        .not('curriculum_url', 'is', null)
    if (fErr) throw fErr
    console.log(`\nFacilities with Submitted Curriculum: ${facs.length}`)
    for (const f of facs) {
        console.log(`- ${f.name} | Status: ${f.curriculum_status} | URL: ${f.curriculum_url}`)
    }

    // 4. Pending documents check
    const { data: docs, error: dErr } = await supabase
        .from('documents')
        .select('id, document_name, status, file_url')
        .eq('status', 'pending')
    if (dErr) throw dErr
    console.log(`\nCompliance Documents Pending Verification: ${docs.length}`)
    for (const d of docs.slice(0, 5)) {
        console.log(`- ${d.document_name} | URL: ${d.file_url}`)
    }

    console.log("\nVerification Complete!")
}

main().catch(console.error)
