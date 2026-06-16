const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USER_ID = '364644b5-f267-4f96-a61e-374da14d1b79';
const NEW_PASSWORD = 'Yeyenbassey@1985';

async function run() {
  console.log(`Setting password for User ID: ${USER_ID} (yeyenbassey@gmail.com)`);
  
  const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
    password: NEW_PASSWORD,
    email_confirm: true // Ensure her email is marked as confirmed
  });
  
  if (error) {
    console.error('Error updating password:', error.message);
  } else {
    console.log('Password successfully set!');
    console.log('User Email:', data.user.email);
    console.log('Confirm status:', data.user.email_confirmed_at ? 'Confirmed' : 'Not Confirmed');
  }
}

run().catch(console.error);
