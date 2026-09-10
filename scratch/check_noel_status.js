const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkNoelStatus() {
  const email = 'noelokorn01@gmail.com';
  console.log(`=== 1. INSPECTING DATABASE FOR ${email} ===`);

  // Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .maybeSingle();

  console.log('Profile:', JSON.stringify(profile, null, 2));

  if (profile) {
    // Membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', profile.id);

    console.log('\nMembership(s):', JSON.stringify(membership, null, 2));

    // Payments
    if (membership && membership.length > 0) {
      const mIds = membership.map(m => m.id);
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .in('membership_id', mIds);

      console.log('\nPayments Table Rows:', JSON.stringify(payments, null, 2));
    }

    // Certificates
    const { data: certs } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', profile.id);

    console.log('\nCertificates:', JSON.stringify(certs, null, 2));
  }

  // Pending Registrations
  const { data: pending } = await supabase
    .from('pending_registrations')
    .select('*')
    .ilike('email', email);

  console.log('\nPending Registration(s):', JSON.stringify(pending, null, 2));
}

checkNoelStatus().catch(console.error);
