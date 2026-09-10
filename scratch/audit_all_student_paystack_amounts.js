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

async function auditPaystackAmounts() {
  console.log("=== AUDITING ALL PAYMENTS IN DATABASE AGAINST PAYSTACK LIVE API ===");

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, transaction_reference, membership_id, payment_type, created_at')
    .eq('status', 'completed');

  console.log(`Total completed payments in DB: ${payments?.length}`);

  let verifiedCount = 0;
  let manualOrAutoCount = 0;
  let mismatchedCount = 0;
  const auditLog = [];

  for (const p of (payments || [])) {
    const ref = p.transaction_reference;

    if (!ref || ref.startsWith('MANUAL-') || ref.startsWith('AUTO-FIX-') || ref.startsWith('AUTO-ADMIT-') || ref.startsWith('REG-SYNC-')) {
      manualOrAutoCount++;
      continue;
    }

    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
        headers: { Authorization: `Bearer ${paystackSecret}` }
      });
      const ps = await res.json();
      if (ps.status && ps.data && ps.data.status === 'success') {
        const actualNaira = ps.data.amount / 100;
        if (actualNaira !== Number(p.amount)) {
          mismatchedCount++;
          console.log(`[MISMATCH DETECTED] ID: ${p.id} | Ref: ${ref} | DB: ₦${p.amount} | Paystack Actual: ₦${actualNaira}`);
          
          // Fix mismatch in DB
          await supabase
            .from('payments')
            .update({ amount: actualNaira })
            .eq('id', p.id);

          auditLog.push({ id: p.id, ref, dbAmount: p.amount, actualAmount: actualNaira, status: 'Fixed' });
        } else {
          verifiedCount++;
        }
      }
    } catch (err) {
      console.error(`Error verifying ref ${ref}:`, err.message);
    }
  }

  console.log(`\n=== AUDIT SUMMARY ===`);
  console.log(`Verified & Matching Paystack: ${verifiedCount}`);
  console.log(`Manual / Admin System Generated References: ${manualOrAutoCount}`);
  console.log(`Mismatches Found & Corrected: ${mismatchedCount}`);
  console.log('Audit Log:', JSON.stringify(auditLog, null, 2));
}

auditPaystackAmounts().catch(console.error);
