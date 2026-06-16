const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const email = 'adebolajoshuaj@gmail.com';
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: {
      redirectTo: 'https://nicnigeria.org/reset-password'
    }
  });

  if (error) {
    console.error('Error generating link:', error);
  } else {
    console.log('Generated Action Link:', data.properties.action_link);
  }
}

run();
