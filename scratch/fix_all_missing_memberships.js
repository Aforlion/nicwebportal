const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixAllActiveMemberships() {
  console.log("=== CHECKING ALL ACTIVE MEMBERSHIPS FOR IS_ACTIVE & EXPIRY_DATE ===");

  const { data: inactiveMemberships, error } = await supabase
    .from('memberships')
    .select('id, user_id, nic_id, status, is_active, expiry_date, created_at')
    .eq('status', 'active')
    .or('is_active.eq.false,expiry_date.is.null');

  if (error) {
    console.error("Error querying memberships:", error);
    return;
  }

  console.log(`Active memberships needing fix (is_active=false or expiry_date=null): ${inactiveMemberships?.length}`);

  let fixedCount = 0;

  for (const mem of (inactiveMemberships || [])) {
    const createdYear = mem.created_at ? new Date(mem.created_at).getFullYear() : 2026;
    const expiryYear = createdYear + 1;
    const dateStr = mem.created_at ? new Date(mem.created_at).toISOString().split('T')[0] : '2026-01-01';
    const expDateStr = `${expiryYear}-${dateStr.substring(5)}`;

    const { error: updErr } = await supabase
      .from('memberships')
      .update({
        is_active: true,
        expiry_date: mem.expiry_date || expDateStr,
        joined_date: dateStr,
        updated_at: new Date().toISOString()
      })
      .eq('id', mem.id);

    if (updErr) {
      console.error(`Error updating membership ID ${mem.id}:`, updErr.message);
    } else {
      fixedCount++;
    }
  }

  console.log(`\n=== MEMBERSHIP STATUS FIX COMPLETE ===`);
  console.log(`Successfully fixed ${fixedCount} membership records to is_active=true with valid expiry dates.`);
}

fixAllActiveMemberships().catch(console.error);
