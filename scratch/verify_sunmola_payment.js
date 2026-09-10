const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function verifySunmola() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .ilike('email', 'sunmolaflorence669@gmail.com')
    .single();

  const { data: membership } = await supabase
    .from('memberships')
    .select('id, nic_id')
    .eq('user_id', profile.id)
    .single();

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('membership_id', membership.id);

  console.log(`=== SUNMOLA PAYMENT VERIFICATION ===`);
  console.log(`Profile: ${profile.full_name} (${profile.email})`);
  console.log(`Membership NIC ID: ${membership.nic_id} (ID: ${membership.id})`);
  console.log(`Payments count: ${payments?.length}`);
  console.log(`Payments details:`, JSON.stringify(payments, null, 2));

  // Check total completed payments revenue sum in payments table now
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');

  const totalRev = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0);
  console.log(`\nNew Total Completed Revenue in Payments Table: ₦${totalRev?.toLocaleString()}`);
}

verifySunmola().catch(console.error);
