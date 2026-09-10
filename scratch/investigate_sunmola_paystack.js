const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const paystackSecret = process.env.PAYSTACK_LIVE_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function investigate() {
  const email = 'sunmolaflorence669@gmail.com';
  console.log(`=== 1. DB RECORDS FOR ${email} ===`);

  // Pending registrations
  const { data: pending } = await supabase
    .from('pending_registrations')
    .select('*')
    .ilike('email', email);
  console.log('Pending Registrations:', JSON.stringify(pending, null, 2));

  // Profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email);
  console.log('Profile:', JSON.stringify(profile, null, 2));

  // Memberships
  if (profile && profile.length > 0) {
    const { data: mem } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', profile[0].id);
    console.log('Membership:', JSON.stringify(mem, null, 2));

    if (mem && mem.length > 0) {
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('membership_id', mem[0].id);
      console.log('Payments Table Rows:', JSON.stringify(payments, null, 2));
    }
  }

  console.log(`\n=== 2. PAYSTACK API INVESTIGATION FOR ${email} ===`);
  // 1. Fetch transactions by customer email from Paystack
  try {
    const res = await fetch(`https://api.paystack.co/transaction?customer=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`
      }
    });
    const paystackData = await res.json();
    console.log('Paystack List Transactions Response status:', paystackData.status);
    console.log('Paystack List Transactions Count:', paystackData.data?.length);
    console.log('Paystack Transactions:', JSON.stringify(paystackData.data, null, 2));
  } catch (err) {
    console.error('Error querying Paystack customer transactions:', err);
  }

  // 2. Also check if reference T920299468883437 exists on Paystack
  const refsToCheck = (pending || []).map(p => p.payment_reference).filter(Boolean);
  refsToCheck.push('T920299468883437');

  for (const ref of Array.from(new Set(refsToCheck))) {
    console.log(`\n--- Paystack Verify Transaction: ${ref} ---`);
    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
        headers: {
          Authorization: `Bearer ${paystackSecret}`
        }
      });
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Error verifying ref ${ref}:`, err);
    }
  }
}

investigate().catch(console.error);
