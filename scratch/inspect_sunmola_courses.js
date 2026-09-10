const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function inspectSunmolaCourses() {
  const email = 'sunmolaflorence669@gmail.com';
  console.log(`=== INSPECTING COURSE & ENROLLMENT RECORDS FOR ${email} ===`);

  // 1. Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .single();

  console.log('Profile:', JSON.stringify(profile, null, 2));

  if (profile) {
    // 2. Enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', profile.id);

    console.log('\nEnrollments for Sunmola:', JSON.stringify(enrollments, null, 2));

    // 3. Certificates
    const { data: certs } = await supabase
      .from('certificates')
      .select('*, courses(*), programs(*)')
      .eq('user_id', profile.id);

    console.log('\nCertificates for Sunmola:', JSON.stringify(certs, null, 2));

    // 4. Assessment Submissions
    const { data: subs } = await supabase
      .from('assessment_submissions')
      .select('*, assessments(*)')
      .in('enrollment_id', (enrollments || []).map(e => e.id));

    console.log('\nAssessment Submissions for Sunmola:', JSON.stringify(subs, null, 2));
  }

  // 5. Pending Registrations
  const { data: pending } = await supabase
    .from('pending_registrations')
    .select('*')
    .ilike('email', email);

  console.log('\nPending Registration details:', JSON.stringify(pending, null, 2));
}

inspectSunmolaCourses().catch(console.error);
