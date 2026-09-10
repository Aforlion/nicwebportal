const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function batchFixActiveMemberships() {
  console.log("=== BATCH FIXING ACTIVE MEMBERSHIPS IS_ACTIVE & EXPIRY_DATE ===");

  // 1. Set is_active = true for all active status memberships
  const { data: upd1, error: err1 } = await supabase
    .from('memberships')
    .update({ is_active: true })
    .eq('status', 'active')
    .eq('is_active', false)
    .select('id');

  if (err1) console.error("Error setting is_active:", err1);
  else console.log(`Updated is_active=true for ${upd1?.length || 0} memberships.`);

  // 2. Set default expiry_date for any membership missing expiry_date
  const { data: nullExpiry } = await supabase
    .from('memberships')
    .select('id, created_at')
    .is('expiry_date', null);

  console.log(`Memberships with null expiry_date: ${nullExpiry?.length || 0}`);

  if (nullExpiry && nullExpiry.length > 0) {
    for (const mem of nullExpiry) {
      const year = mem.created_at ? new Date(mem.created_at).getFullYear() + 1 : 2027;
      const datePart = mem.created_at ? new Date(mem.created_at).toISOString().split('T')[0].substring(5) : '01-01';
      const expDate = `${year}-${datePart}`;

      await supabase
        .from('memberships')
        .update({ expiry_date: expDate })
        .eq('id', mem.id);
    }
    console.log("Updated all missing expiry dates!");
  }
}

batchFixActiveMemberships().catch(console.error);
