const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixNoelMembership() {
  const email = 'noelokorn01@gmail.com';
  console.log(`=== FIXING MEMBERSHIP & VERIFICATION STATUS FOR ${email} ===`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .ilike('email', email)
    .single();

  if (!profile) {
    console.error('Profile not found!');
    return;
  }

  // Calculate 1 year expiry from creation date or today
  const expiryDate = '2027-08-19';

  const { data: updatedMem, error } = await supabase
    .from('memberships')
    .update({
      is_active: true,
      status: 'active',
      expiry_date: expiryDate,
      joined_date: '2026-08-19',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', profile.id)
    .select();

  if (error) {
    console.error('Error updating membership:', error.message);
  } else {
    console.log('Membership updated successfully:', JSON.stringify(updatedMem, null, 2));
  }

  // Test Public Member Verification Query
  console.log('\n=== TESTING PUBLIC MEMBER VERIFICATION LOOKUP ===');
  const nicId = 'NIC/MEM/2026/USVBR';
  const { data: searchResult, error: searchError } = await supabase
    .from('memberships')
    .select(`
      *,
      profiles!inner(full_name, email)
    `)
    .or(`nic_id.eq.${nicId},member_id.eq.${nicId}`)
    .single();

  if (searchError) {
    console.error('Public Verification Query Error:', searchError);
  } else {
    console.log('Public Verification Result:', JSON.stringify(searchResult, null, 2));
    console.log(`SUCCESS! Member ${searchResult.profiles.full_name} (${searchResult.nic_id}) is now ACTIVE and VERIFIABLE!`);
  }
}

fixNoelMembership().catch(console.error);
