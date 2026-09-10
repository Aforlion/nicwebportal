const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function inspectPayments() {
  console.log("=== 1. ALL PAYMENTS TABLE ROWS ===");
  const { data: payments, error: pErr } = await supabase
    .from('payments')
    .select('*')
    .limit(50);
  
  if (pErr) console.error('Error querying payments:', pErr);
  else {
    console.log(`Total payments found: ${payments?.length}`);
    if (payments && payments.length > 0) {
      console.log('Sample payment keys:', Object.keys(payments[0]));
      console.log('Statuses in payments:', Array.from(new Set(payments.map(p => p.status))));
      console.log('Sample payment records:');
      console.log(JSON.stringify(payments.slice(0, 10), null, 2));
    }
  }

  console.log("\n=== 2. SEARCH FOR SUNMOLA FLORENCE OLUWAKEMISOLA ===");
  // Find profile
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .ilike('full_name', '%Sunmola%');
  console.log('Profiles matching Sunmola:', JSON.stringify(profiles, null, 2));

  if (profiles && profiles.length > 0) {
    const sunmolaId = profiles[0].id;
    
    // Find membership
    const { data: memberships } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', sunmolaId);
    console.log('Memberships for Sunmola:', JSON.stringify(memberships, null, 2));

    // Search payments by membership_id or user_id or email
    if (memberships && memberships.length > 0) {
      const mId = memberships[0].id;
      const { data: pByMem } = await supabase
        .from('payments')
        .select('*')
        .eq('membership_id', mId);
      console.log(`Payments by membership_id (${mId}):`, JSON.stringify(pByMem, null, 2));
    }

    const { data: pByUser } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', sunmolaId);
    console.log(`Payments by user_id (${sunmolaId}):`, JSON.stringify(pByUser, null, 2));

    // Search in pending_registrations
    const { data: pendingRegs } = await supabase
      .from('pending_registrations')
      .select('*')
      .ilike('email', `%${profiles[0].email}%`);
    console.log('Pending registrations matching email:', JSON.stringify(pendingRegs, null, 2));
  }

  console.log("\n=== 3. PAYMENTS TABLE SUMMARY ===");
  // Check payments by status count
  const { data: statusCounts } = await supabase.from('payments').select('status');
  if (statusCounts) {
    const counts = {};
    statusCounts.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    console.log('Payment counts grouped by status column value:', counts);
  }
}

inspectPayments().catch(console.error);
