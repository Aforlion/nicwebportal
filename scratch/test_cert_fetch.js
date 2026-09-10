const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const code = 'NCNA-2026-66856';
  const { data: cert, error } = await supabase
    .from('certificates')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      ),
      programs:program_id (
        title
      ),
      courses:course_id (
        title
      )
    `)
    .eq('certificate_number', code)
    .single();

  console.log('Fetch result:', { cert, error });
}

run().catch(console.error);
