const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('\n=== Scanning ALL users for missing passwords ===\n');

  let page = 0;
  let allUsers = [];
  
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) { console.error('Error:', error); break; }
    if (!data.users || data.users.length === 0) break;
    allUsers = allUsers.concat(data.users);
    if (data.users.length < 1000) break;
    page++;
  }

  console.log(`Total users in auth: ${allUsers.length}`);

  const noPassword = allUsers.filter(u => !u.encrypted_password || u.encrypted_password.length < 10);
  const neverLoggedIn = allUsers.filter(u => !u.last_sign_in_at);
  const emailNotConfirmed = allUsers.filter(u => !u.email_confirmed_at);

  console.log(`\nUsers with NO password set: ${noPassword.length}`);
  noPassword.forEach(u => {
    console.log(`  - ${u.email} (created: ${u.created_at?.split('T')[0]}, last_sign_in: ${u.last_sign_in_at?.split('T')[0] || 'NEVER'}, recovery_sent: ${u.recovery_sent_at?.split('T')[0] || 'N/A'})`);
  });

  console.log(`\nUsers who have NEVER logged in: ${neverLoggedIn.length}`);
  neverLoggedIn.slice(0, 20).forEach(u => {
    console.log(`  - ${u.email} (created: ${u.created_at?.split('T')[0]}, provider: ${u.app_metadata?.provider})`);
  });
  if (neverLoggedIn.length > 20) console.log(`  ... and ${neverLoggedIn.length - 20} more`);

  console.log(`\nUsers with email NOT confirmed: ${emailNotConfirmed.length}`);
  emailNotConfirmed.forEach(u => {
    console.log(`  - ${u.email}`);
  });

  console.log('\n=== DONE ===');
}

run().catch(console.error);
