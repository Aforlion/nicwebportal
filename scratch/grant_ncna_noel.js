const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'noelokorn01@gmail.com';

async function run() {
  console.log(`\n=== Granting Certified Nursing Assistant Certificate to ${TARGET_EMAIL} ===\n`);

  // 1. Locate User
  const { data: authData } = await supabase.auth.admin.listUsers();
  const user = authData?.users?.find(u => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase());
  
  if (!user) {
    console.error('User not found in Supabase auth!');
    return;
  }

  const userId = user.id;
  console.log('User ID:', userId);

  // Update profile kyc_status to approved & role to member
  await supabase
    .from('profiles')
    .update({ role: 'member', kyc_status: 'approved' })
    .eq('id', userId);

  // Check existing certificates
  const { data: existingCerts } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId);

  let ncnaCert = existingCerts?.find(c => c.certificate_number?.startsWith('NCNA'));

  if (!ncnaCert) {
    const certNum = `NCNA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const issueDate = new Date().toISOString().split('T')[0];
    
    console.log(`Creating new NCNA certificate: ${certNum}...`);

    const { data: newCert, error: certErr } = await supabase
      .from('certificates')
      .insert({
        certificate_number: certNum,
        user_id: userId,
        is_verified: true,
        issue_date: issueDate,
        course_level: 'National Certified Nursing Assistant (NCNA)'
      })
      .select()
      .single();

    if (certErr) {
      console.error('Error inserting NCNA certificate:', certErr);
    } else {
      console.log('Successfully issued NCNA certificate:', newCert);
      ncnaCert = newCert;
    }
  } else {
    console.log('User already has NCNA Certificate:', ncnaCert);
  }

  // Verify full setup
  const { data: finalCerts } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId);

  console.log('\nFinal Certificates for User:', finalCerts);
}

run().catch(console.error);
