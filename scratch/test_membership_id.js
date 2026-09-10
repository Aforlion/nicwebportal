const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const code = 'NCNA-2026-66856';
  const { data: cert } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_number', code)
    .single();

  if (cert && cert.user_id) {
    const { data: mem } = await supabase
      .from('memberships')
      .select('nic_id, member_id, category')
      .eq('user_id', cert.user_id)
      .maybeSingle();

    console.log('Cert User ID:', cert.user_id);
    console.log('Real Student/Member ID from database:', mem);
  }
}

run().catch(console.error);
