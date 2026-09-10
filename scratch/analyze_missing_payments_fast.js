const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function analyzeFast() {
  const { data: pendingRegs } = await supabase
    .from('pending_registrations')
    .select('*')
    .in('status', ['completed', 'paid', 'admitted']);

  const emails = (pendingRegs || []).map(r => r.email).filter(Boolean);
  
  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('email', emails);

  const profileMap = new Map();
  (profiles || []).forEach(p => profileMap.set(p.email.toLowerCase(), p));

  const userIds = (profiles || []).map(p => p.id);

  // Fetch memberships
  const { data: memberships } = await supabase
    .from('memberships')
    .select('id, user_id, nic_id, category')
    .in('user_id', userIds);

  const membershipMap = new Map();
  (memberships || []).forEach(m => membershipMap.set(m.user_id, m));

  const membershipIds = (memberships || []).map(m => m.id);

  // Fetch existing payments
  const { data: payments } = await supabase
    .from('payments')
    .select('membership_id, transaction_reference, amount')
    .in('membership_id', membershipIds);

  const paymentSet = new Set();
  (payments || []).forEach(p => paymentSet.add(p.membership_id));

  console.log(`Total completed/paid pending registrations: ${pendingRegs?.length}`);
  console.log(`Profiles found: ${profiles?.length}`);
  console.log(`Memberships found: ${memberships?.length}`);
  console.log(`Unique memberships with payment records: ${paymentSet.size}`);

  const missingList = [];
  for (const reg of (pendingRegs || [])) {
    const prof = profileMap.get(reg.email.toLowerCase());
    if (!prof) continue;
    const mem = membershipMap.get(prof.id);
    if (!mem) continue;
    if (!paymentSet.has(mem.id)) {
      missingList.push({
        profileId: prof.id,
        fullName: prof.full_name,
        email: prof.email,
        membershipId: mem.id,
        nicId: mem.nic_id,
        category: mem.category,
        regType: reg.registration_type,
        ref: reg.payment_reference,
        formData: reg.form_data,
        createdAt: reg.created_at
      });
    }
  }

  console.log(`\n=== MISSING PAYMENTS COUNT: ${missingList.length} ===`);
  console.log(JSON.stringify(missingList, null, 2));
}

analyzeFast().catch(console.error);
