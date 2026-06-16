const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'adebolajoshuaj@gmail.com';

async function run() {
  console.log(`\n=== Investigating login issues for: ${TARGET_EMAIL} ===\n`);

  // 1. Check auth.users via admin API
  console.log('--- Step 1: Checking Auth User ---');
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing users:', authError.message);
  } else {
    const authUser = authData.users.find(u => u.email === TARGET_EMAIL);
    if (!authUser) {
      console.log('AUTH USER: NOT FOUND in Supabase Auth!');
    } else {
      console.log('AUTH USER FOUND:');
      console.log('  ID:', authUser.id);
      console.log('  Email:', authUser.email);
      console.log('  Email Confirmed:', authUser.email_confirmed_at ? `YES (${authUser.email_confirmed_at})` : 'NO - EMAIL NOT CONFIRMED!');
      console.log('  Created At:', authUser.created_at);
      console.log('  Last Sign In:', authUser.last_sign_in_at || 'NEVER');
      console.log('  Password Set:', authUser.encrypted_password ? (authUser.encrypted_password.length > 5 ? 'YES (has hash)' : 'NO - Empty password!') : 'NO - No password!');
      console.log('  User Metadata:', JSON.stringify(authUser.user_metadata, null, 2));
      console.log('  App Metadata:', JSON.stringify(authUser.app_metadata, null, 2));
      console.log('  Invited At:', authUser.invited_at || 'N/A');
      console.log('  Confirmation Sent At:', authUser.confirmation_sent_at || 'N/A');
      console.log('  Recovery Sent At:', authUser.recovery_sent_at || 'N/A');
      
      // 2. Check profile
      console.log('\n--- Step 2: Checking Profile ---');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError) {
        console.error('Profile error:', profileError.message);
        // Try by email
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', TARGET_EMAIL)
          .single();
        if (profileByEmail) {
          console.log('  Profile found by email (ID mismatch!):', JSON.stringify(profileByEmail, null, 2));
        } else {
          console.log('  NO profile found for this user!');
        }
      } else {
        console.log('PROFILE FOUND:');
        console.log('  ID:', profile.id);
        console.log('  Name:', profile.full_name);
        console.log('  Email:', profile.email);
        console.log('  Role:', profile.role);
        console.log('  Created At:', profile.created_at);
      }
      
      // 3. Check memberships
      console.log('\n--- Step 3: Checking Memberships ---');
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', authUser.id);
      
      if (membershipError) {
        console.error('Membership error:', membershipError.message);
      } else if (!memberships || memberships.length === 0) {
        console.log('  NO memberships found for this user.');
      } else {
        memberships.forEach((m, i) => {
          console.log(`  Membership ${i + 1}:`);
          console.log('    ID:', m.id);
          console.log('    Category:', m.category);
          console.log('    Status:', m.status);
          console.log('    Is Active:', m.is_active);
          console.log('    NIC ID:', m.nic_id);
          console.log('    Expiry:', m.expiry_date);
        });
      }
    }
  }
  
  // 4. Check pending registrations
  console.log('\n--- Step 4: Checking Pending Registrations ---');
  const { data: pending, error: pendingError } = await supabase
    .from('pending_registrations')
    .select('*')
    .eq('email', TARGET_EMAIL);
  
  if (pendingError) {
    console.error('Pending reg error:', pendingError.message);
  } else if (!pending || pending.length === 0) {
    console.log('  NO pending registrations found.');
  } else {
    pending.forEach((p, i) => {
      console.log(`  Pending ${i + 1}: ID=${p.id} Type=${p.registration_type} Status=${p.status}`);
      console.log('    Form data password length:', p.form_data?.password?.length || 'N/A');
    });
  }

  console.log('\n=== DONE ===');
}

run().catch(console.error);
