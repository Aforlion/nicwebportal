const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixSunmolaProperly() {
  const email = 'sunmolaflorence669@gmail.com';
  console.log(`=== FIXING PAYMENTS PROPERLY FOR ${email} ===`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .ilike('email', email)
    .single();

  const { data: membership } = await supabase
    .from('memberships')
    .select('id, nic_id')
    .eq('user_id', profile.id)
    .single();

  console.log(`Profile ID: ${profile.id} | Membership ID: ${membership.id}`);

  // 1. Update/Upsert Registration Payment (Ref: T920299468883437, Amount: 5000)
  const { data: regPay, error: regErr } = await supabase
    .from('payments')
    .upsert({
      membership_id: membership.id,
      amount: 5000,
      payment_type: 'membership_dues',
      payment_method: 'paystack',
      transaction_reference: 'T920299468883437',
      status: 'completed',
      payment_date: '2026-09-05T07:08:26.004786+00:00',
      updated_at: new Date().toISOString()
    }, { onConflict: 'transaction_reference' })
    .select();

  if (regErr) console.error("Error upserting reg payment:", regErr.message);
  else console.log("Registration Payment Fixed:", JSON.stringify(regPay, null, 2));

  // 2. Insert/Upsert Course Payment (Ref: 1788593772262, Amount: 20)
  const { data: coursePay, error: courseErr } = await supabase
    .from('payments')
    .upsert({
      membership_id: membership.id,
      amount: 20,
      payment_type: 'course_fee',
      payment_method: 'paystack',
      transaction_reference: '1788593772262',
      status: 'completed',
      payment_date: '2026-09-05T07:36:30.000Z',
      updated_at: new Date().toISOString()
    }, { onConflict: 'transaction_reference' })
    .select();

  if (courseErr) console.error("Error upserting course payment:", courseErr.message);
  else console.log("Course Payment Fixed:", JSON.stringify(coursePay, null, 2));

  // Fetch all payments for Sunmola
  const { data: finalPayments } = await supabase
    .from('payments')
    .select('*')
    .eq('membership_id', membership.id);

  console.log('\n=== FINAL PAYMENTS FOR SUNMOLA ===');
  console.log(JSON.stringify(finalPayments, null, 2));
}

fixSunmolaProperly().catch(console.error);
