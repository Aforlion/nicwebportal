const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const paystackSecret = process.env.PAYSTACK_LIVE_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkAndBackfillCoursePayments() {
  console.log("=== CHECKING COURSE ENROLLMENTS VS PAYMENTS TABLE ===");

  // 1. Fetch all enrollments with payment_status = 'paid'
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('*, courses(id, title, price), profiles(id, full_name, email)')
    .eq('payment_status', 'paid');

  if (enrollError) {
    console.error("Error fetching enrollments:", enrollError);
    return;
  }

  console.log(`Total 'paid' enrollments in DB: ${enrollments?.length || 0}`);

  // 2. Fetch all existing payment references in payments table
  const { data: existingPayments, error: payError } = await supabase
    .from('payments')
    .select('transaction_reference');

  if (payError) {
    console.error("Error fetching payments:", payError);
    return;
  }

  const existingRefMap = new Set(
    (existingPayments || []).map(p => p.transaction_reference).filter(Boolean)
  );

  const missingEnrollments = [];

  for (const enroll of (enrollments || [])) {
    const ref = enroll.payment_reference;
    if (!ref || !existingRefMap.has(ref)) {
      missingEnrollments.push(enroll);
    }
  }

  console.log(`Enrollments missing from 'payments' table: ${missingEnrollments.length}`);

  for (const enroll of missingEnrollments) {
    const userEmail = enroll.profiles?.email || 'Unknown';
    const userName = enroll.profiles?.full_name || 'Caregiver';
    const courseTitle = enroll.courses?.title || 'Course';
    const ref = enroll.payment_reference || `ENROLL-SYNC-${enroll.id.substring(0, 8)}`;
    const enrolledAt = enroll.enrolled_at || new Date().toISOString();

    let amount = enroll.courses?.price || 0;

    // Check Paystack for exact amount if reference exists
    if (ref && !ref.startsWith('ENROLL-SYNC-') && paystackSecret) {
      try {
        const pRes = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
          headers: { Authorization: `Bearer ${paystackSecret}` }
        });
        const pData = await pRes.json();
        if (pData.status && pData.data?.amount) {
          amount = pData.data.amount / 100;
        }
      } catch (err) {
        console.warn(`Paystack verification fallback for ${ref}:`, err.message);
      }
    }

    console.log(`[MISSING PAYMENT] Learner: ${userName} (${userEmail}) | Course: "${courseTitle}" | Paid Amount: ₦${amount.toLocaleString()} | Ref: ${ref} | Date: ${enrolledAt}`);

    // Fetch membership if exists
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', enroll.user_id)
      .maybeSingle();

    const { data: inserted, error: insErr } = await supabase
      .from('payments')
      .insert({
        membership_id: membership?.id || null,
        amount: amount,
        payment_type: 'course_enrollment',
        payment_method: 'paystack',
        transaction_reference: ref,
        status: 'completed',
        payment_date: enrolledAt,
        created_at: enrolledAt,
        updated_at: new Date().toISOString()
      })
      .select();

    if (insErr) {
      console.error(`❌ Failed to backfill payment for ${userName}:`, insErr.message);
    } else {
      console.log(`✅ Backfilled payment record for ${userName} (₦${amount.toLocaleString()})`);
    }
  }

  console.log("\n=== BACKFILL CHECK COMPLETE ===");
}

checkAndBackfillCoursePayments().catch(console.error);
