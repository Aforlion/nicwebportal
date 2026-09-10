const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function activateMembership() {
  const userId = 'b1cd2d74-180a-4236-b01c-72b480564461';
  const { data, error } = await adminClient
    .from('memberships')
    .update({ is_active: true, status: 'active' })
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error setting is_active:', error.message);
  } else {
    console.log('Membership is_active set to true:', JSON.stringify(data, null, 2));
  }
}

activateMembership();
