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

async function backfillMissingPayments() {
  console.log("=== STARTING BACKFILL OF MISSING PAYMENTS ===");

  // 1. Fetch all completed/paid/admitted pending registrations
  const { data: pendingRegs, error: pErr } = await supabase
    .from('pending_registrations')
    .select('*')
    .in('status', ['completed', 'paid', 'admitted']);

  if (pErr) {
    console.error("Error fetching pending registrations:", pErr);
    return;
  }

  const emails = (pendingRegs || []).map(r => r.email).filter(Boolean);
  
  // 2. Fetch corresponding profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('email', emails);

  const profileMap = new Map();
  (profiles || []).forEach(p => profileMap.set(p.email.toLowerCase(), p));

  const userIds = (profiles || []).map(p => p.id);

  // 3. Fetch memberships
  const { data: memberships } = await supabase
    .from('memberships')
    .select('id, user_id, nic_id, category')
    .in('user_id', userIds);

  const membershipMap = new Map();
  (memberships || []).forEach(m => membershipMap.set(m.user_id, m));

  const membershipIds = (memberships || []).map(m => m.id);

  // 4. Fetch existing payments
  const { data: existingPayments } = await supabase
    .from('payments')
    .select('membership_id, transaction_reference, amount')
    .in('membership_id', membershipIds);

  const paymentSet = new Set();
  (existingPayments || []).forEach(p => paymentSet.add(p.membership_id));

  let insertedCount = 0;
  let skippedCount = 0;

  for (const reg of (pendingRegs || [])) {
    const prof = profileMap.get(reg.email.toLowerCase());
    if (!prof) continue;
    
    const mem = membershipMap.get(prof.id);
    if (!mem) continue;

    // If membership already has payment record, skip
    if (paymentSet.has(mem.id)) {
      skippedCount++;
      continue;
    }

    // Determine payment amount & type
    let amount = 50000; // Default individual membership dues
    let paymentType = 'membership_dues';

    if (mem.category === 'student' || reg.form_data?.category === 'student') {
      amount = 35000;
    } else if (mem.category === 'institutional' || reg.registration_type === 'facility') {
      amount = 100000;
      paymentType = 'facility_registration';
    } else if (reg.form_data?.total_paid && Number(reg.form_data.total_paid) > 0) {
      amount = Number(reg.form_data.total_paid);
    } else if (reg.form_data?.amount && Number(reg.form_data.amount) > 0) {
      amount = Number(reg.form_data.amount);
    }

    const ref = reg.payment_reference || `REG-SYNC-${mem.nic_id || prof.id.substring(0, 8)}`;
    const paymentDate = reg.created_at || new Date().toISOString();

    const { data: inserted, error: insErr } = await supabase
      .from('payments')
      .insert({
        membership_id: mem.id,
        amount: amount,
        payment_type: paymentType,
        payment_method: 'paystack',
        transaction_reference: ref,
        status: 'completed',
        payment_date: paymentDate,
        created_at: paymentDate,
        updated_at: new Date().toISOString()
      })
      .select();

    if (insErr) {
      console.error(`Failed to insert payment for ${prof.full_name} (${prof.email}):`, insErr.message);
    } else {
      insertedCount++;
      paymentSet.add(mem.id); // Mark as paid
      console.log(`[INSERTED] ${prof.full_name} (${prof.email}) | Amount: ₦${amount.toLocaleString()} | MemID: ${mem.id} | Ref: ${ref}`);
    }
  }

  console.log(`\n=== BACKFILL COMPLETE ===`);
  console.log(`Successfully Backfilled Payments: ${insertedCount}`);
  console.log(`Already Had Payments: ${skippedCount}`);
}

backfillMissingPayments().catch(console.error);
