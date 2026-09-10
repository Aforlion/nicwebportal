const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function analyzePendingAndPayments() {
  console.log("=== 1. FETCH ALL COMPLETED/PAID PENDING REGISTRATIONS ===");
  const { data: pendingRegs, error: pErr } = await supabase
    .from('pending_registrations')
    .select('*');
    
  if (pErr) {
    console.error("Error fetching pending_registrations:", pErr);
    return;
  }

  console.log(`Total pending_registrations records: ${pendingRegs?.length}`);
  
  const completedOrPaid = pendingRegs.filter(r => r.status === 'completed' || r.status === 'paid' || r.status === 'admitted');
  console.log(`Total completed/paid/admitted pending_registrations: ${completedOrPaid.length}`);

  let missingPaymentsCount = 0;
  let matchesFound = 0;

  for (const reg of completedOrPaid) {
    // Find profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('email', reg.email)
      .maybeSingle();

    if (!profile) {
      console.log(`[NO PROFILE] Pending Reg Email: ${reg.email} (Status: ${reg.status}, Ref: ${reg.payment_reference})`);
      continue;
    }

    // Find membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, nic_id, category')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (!membership) {
      console.log(`[NO MEMBERSHIP] Profile: ${profile.full_name} (${profile.email})`);
      continue;
    }

    // Check payments table for this membership_id
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('membership_id', membership.id);

    if (!existingPayments || existingPayments.length === 0) {
      missingPaymentsCount++;
      console.log(`[MISSING PAYMENT] Profile: ${profile.full_name} | Email: ${reg.email} | MemID: ${membership.id} | NIC_ID: ${membership.nic_id} | Type: ${reg.registration_type} | Ref: ${reg.payment_reference}`);
    } else {
      matchesFound++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Matched memberships with payments: ${matchesFound}`);
  console.log(`Memberships MISSING payment records: ${missingPaymentsCount}`);
}

analyzePendingAndPayments().catch(console.error);
