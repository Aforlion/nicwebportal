const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const code = 'NIC/TRN/2026/U5OLO';
  console.log('Searching for facility with code:', code);

  // 1. Check facilities table
  const { data: facilities, error: facErr } = await supabase
    .from('facilities')
    .select('*');
  
  if (facErr) {
    console.error('Error fetching facilities:', facErr);
    return;
  }

  const matching = facilities.filter(f => 
    (f.code && f.code.includes('U5OLO')) ||
    (f.name && f.name.includes('U5OLO')) ||
    (f.cac_reg_number && f.cac_reg_number.includes('U5OLO'))
  );

  console.log('Matching facilities:', matching);

  if (matching.length === 0) {
    console.log('Listing all facility codes:');
    facilities.forEach(f => console.log(`- ${f.id} | ${f.name} | Code: ${f.code} | Type: ${f.facility_type}`));
  }

  // 2. Also check accreditation_applications
  const { data: apps, error: appErr } = await supabase
    .from('accreditation_applications')
    .select('*');
  console.log('\nTotal accreditation applications:', apps?.length);
  if (apps) {
    apps.forEach(a => {
      console.log(`App: ${a.id} | Facility: ${a.facility_id} | Status: ${a.status} | Curriculum doc:`, a.curriculum_doc_url, a.curriculum_url, a.documents);
    });
  }

  // 3. Check facility_curricula or curriculum tables
  const tables = ['facility_curricula', 'facility_curriculum', 'curriculums', 'curriculum_evaluations', 'facility_documents', 'documents'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(5);
    if (!error) {
      console.log(`\nTable [${t}] exists, rows count (sampled):`, data.length);
      if (data.length > 0) console.log(data[0]);
    }
  }

  // 4. Also check storage buckets
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('\nStorage buckets:', buckets?.map(b => b.name));

  for (const b of ['curriculum', 'curriculums', 'documents', 'facility-documents', 'accreditation']) {
    try {
      const { data: files } = await supabase.storage.from(b).list();
      if (files && files.length > 0) {
        console.log(`Bucket [${b}] files:`, files.map(f => f.name));
      }
    } catch (e) {}
  }
}

inspect().catch(console.error);
