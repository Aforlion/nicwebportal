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
  const facilityId = 'd2c37ddb-fcee-4bd8-90be-4aaa7a95de92'; // Mykin Ltd
  
  console.log('1. Setting facility owner_id to NULL temporarily...');
  const { error: f1Error } = await supabase
    .from('facilities')
    .update({ owner_id: null })
    .eq('id', facilityId);

  if (f1Error) {
    console.error('Error setting owner_id to NULL:', f1Error);
    return;
  }
  console.log('Facility owner_id cleared.');

  console.log('2. Deleting existing profile for Adija Uzodinma...');
  const { error: dError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', adijaUserId);

  if (dError) {
    console.error('Error deleting profile:', dError);
    // Restore owner_id just in case
    await supabase.from('facilities').update({ owner_id: adijaUserId }).eq('id', facilityId);
    return;
  }
  console.log('Profile deleted.');

  console.log('3. Re-inserting profile with facility_admin role...');
  const { data: pData, error: pError } = await supabase
    .from('profiles')
    .insert({
      id: adijaUserId,
      full_name: 'Adija Uzodinma',
      email: 'adija@mykin.ng',
      role: 'facility_admin'
    })
    .select();

  if (pError) {
    console.error('Error re-inserting profile:', pError);
    // Restore owner_id just in case
    await supabase.from('facilities').update({ owner_id: adijaUserId }).eq('id', facilityId);
    return;
  }
  console.log('Profile re-inserted:', pData);

  console.log('4. Restoring facility owner_id and activating facility...');
  const { data: fData, error: fError } = await supabase
    .from('facilities')
    .update({ 
      owner_id: adijaUserId,
      status: 'active',
      name: 'MyKin Care Agency', // Keep name clean as Care Agency
      compliance_status: 'compliant'
    })
    .eq('id', facilityId)
    .select();

  if (fError) {
    console.error('Error restoring facility owner:', fError);
    return;
  }
  console.log('Facility updated and activated:', fData);

  console.log('5. Syncing auth metadata to role=facility_admin...');
  const { error: authError } = await supabase.auth.admin.updateUserById(adijaUserId, {
    user_metadata: { role: "facility_admin" }
  });
  if (authError) {
    console.error('Error updating auth metadata:', authError);
  } else {
    console.log('Auth metadata updated.');
  }
}

run();
