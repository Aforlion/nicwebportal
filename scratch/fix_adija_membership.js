const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      acc[match[1]] = value;
    }
    return acc;
  }, {});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const adijaUserId = 'c7bf534f-8c35-4644-b70a-7d820563f732';

  console.log('Fetching memberships for Adija...');
  const { data: memberships, error: mError } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', adijaUserId);

  if (mError) {
    console.error('Error fetching memberships:', mError);
    return;
  }

  console.log('Current memberships:', JSON.stringify(memberships, null, 2));

  if (memberships && memberships.length > 0) {
    console.log('Updating membership category to institutional...');
    const { data: updated, error: uError } = await supabase
      .from('memberships')
      .update({ category: 'institutional' })
      .eq('user_id', adijaUserId)
      .select();

    if (uError) {
      console.error('Error updating membership category:', uError);
    } else {
      console.log('Membership category updated to institutional:', JSON.stringify(updated, null, 2));
    }
  } else {
    console.log('No membership record found. Creating institutional membership...');
    const { data: created, error: cError } = await supabase
      .from('memberships')
      .insert({
        user_id: adijaUserId,
        category: 'institutional',
        is_active: true,
        nic_id: 'NIC/FAC/2026/MYKIN'
      })
      .select();

    if (cError) {
      console.error('Error creating institutional membership:', cError);
    } else {
      console.log('Institutional membership created:', JSON.stringify(created, null, 2));
    }
  }
}

run();
