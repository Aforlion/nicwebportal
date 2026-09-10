const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixSunmolaAmount() {
  console.log("=== FIXING SUNMOLA PAYMENT AMOUNT ===");

  // Find payment record for transaction reference T920299468883437
  const { data: updated, error } = await supabase
    .from('payments')
    .update({ amount: 5000 })
    .eq('transaction_reference', 'T920299468883437')
    .select();

  if (error) {
    console.error("Error updating payment row:", error);
  } else {
    console.log("Successfully updated payment record to ₦5,000:", JSON.stringify(updated, null, 2));
  }

  // Also check if any other student payment records in payments table were initialized via Paystack
  const { data: allPayments } = await supabase
    .from('payments')
    .select('id, amount, transaction_reference, membership_id')
    .eq('status', 'completed');

  console.log(`Total payments in DB: ${allPayments?.length}`);
  const sunmolaPayment = allPayments?.find(p => p.transaction_reference === 'T920299468883437');
  console.log('Sunmola payment now:', sunmolaPayment);
}

fixSunmolaAmount().catch(console.error);
