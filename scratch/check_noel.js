const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'noelokorn01@gmail.com';

async function run() {
  console.log(`\n=== Checking User & Certificates for: ${TARGET_EMAIL} ===\n`);

  // 1. Auth Users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Auth list error:', authError);
    return;
  }
  
  const user = authData.users.find(u => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase());
  console.log('Auth user:', user ? { id: user.id, email: user.email, created_at: user.created_at } : 'NOT FOUND');

  // 2. Profiles
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', TARGET_EMAIL);
  console.log('\nProfiles:', profiles);

  // 3. Memberships
  let userId = user?.id || profiles?.[0]?.id;
  if (userId) {
    const { data: memberships } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId);
    console.log('\nMemberships:', memberships);

    const { data: certs } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId);
    console.log('\nCertificates by user_id:', certs);
  }

  // Also check certificates table overall
  const { data: allCerts } = await supabase
    .from('certificates')
    .select('*');
  console.log('\nTotal certificates in DB:', allCerts?.length);
  if (allCerts) {
    console.log('All certificates list sample:', JSON.stringify(allCerts.slice(0, 10), null, 2));
  }
}

run().catch(console.error);
