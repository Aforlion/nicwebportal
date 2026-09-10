const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function resolveUser() {
  const targetEmail = 'ayoasojo@gmail.com';
  const newPassword = 'AyoAsojo@NIC2026!';

  console.log(`=== Inspecting Auth Users for: ${targetEmail} ===`);
  
  let targetAuthUser = null;
  let page = 1;
  while (true) {
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 100
    });
    
    if (listError) {
      console.error('Error listing users:', listError.message);
      return;
    }
    
    if (!usersData.users || usersData.users.length === 0) break;

    targetAuthUser = usersData.users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (targetAuthUser) break;
    page++;
  }

  if (!targetAuthUser) {
    console.log(`User ${targetEmail} NOT found in auth.users! Creating user now...`);
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: targetEmail,
      password: newPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Ayo Asojo' }
    });
    if (createError) {
      console.error('Failed to create auth user:', createError.message);
      return;
    }
    targetAuthUser = newUser.user;
    console.log(`Created new auth user! ID: ${targetAuthUser.id}`);
  } else {
    console.log(`User found in auth.users:`);
    console.log(`  - ID: ${targetAuthUser.id}`);
    console.log(`  - Email: ${targetAuthUser.email}`);
    console.log(`  - Email Confirmed At: ${targetAuthUser.email_confirmed_at}`);
    console.log(`  - Confirmed At: ${targetAuthUser.confirmed_at}`);
    console.log(`  - App Metadata:`, JSON.stringify(targetAuthUser.app_metadata));
    console.log(`  - User Metadata:`, JSON.stringify(targetAuthUser.user_metadata));
    console.log(`  - Banned / Suspended:`, targetAuthUser.banned_until || 'No');

    console.log(`\n=== Setting New Password & Confirming Email ===`);
    const { error: updateError } = await adminClient.auth.admin.updateUserById(targetAuthUser.id, {
      password: newPassword,
      email_confirm: true,
      user_metadata: { ...targetAuthUser.user_metadata, email_confirmed: true }
    });

    if (updateError) {
      console.error('Failed to update user password:', updateError.message);
      return;
    }
    console.log(`Successfully updated password to: ${newPassword} & confirmed email!`);
  }

  // Inspect Public Profiles
  console.log(`\n=== Inspecting public.profiles for ID: ${targetAuthUser.id} ===`);
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', targetAuthUser.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching profile:', profileError.message);
  } else if (!profile) {
    console.log('Profile missing! Creating profile record...');
    const { data: newProfile, error: insertProfileError } = await adminClient
      .from('profiles')
      .insert({
        id: targetAuthUser.id,
        email: targetEmail,
        full_name: targetAuthUser.user_metadata?.full_name || 'Ayo Asojo',
        role: targetAuthUser.user_metadata?.role || 'member'
      })
      .select()
      .single();

    if (insertProfileError) {
      console.error('Failed to create profile:', insertProfileError.message);
    } else {
      console.log('Profile created:', JSON.stringify(newProfile, null, 2));
    }
  } else {
    console.log('Profile found in public.profiles:');
    console.log(JSON.stringify(profile, null, 2));
  }

  // Inspect Memberships
  console.log(`\n=== Inspecting public.memberships for User ID: ${targetAuthUser.id} ===`);
  const { data: memberships, error: memError } = await adminClient
    .from('memberships')
    .select('*')
    .eq('user_id', targetAuthUser.id);

  if (memError) {
    console.error('Error fetching memberships:', memError.message);
  } else {
    console.log(`Memberships found (${memberships?.length || 0}):`);
    console.log(JSON.stringify(memberships, null, 2));
    
    if (!memberships || memberships.length === 0) {
      console.log('Creating default active membership for user...');
      const { data: newMem, error: createMemErr } = await adminClient
        .from('memberships')
        .insert({
          user_id: targetAuthUser.id,
          category: 'individual',
          status: 'active',
          is_active: true
        })
        .select();

      if (createMemErr) {
        console.error('Failed to create membership:', createMemErr.message);
      } else {
        console.log('Membership created:', JSON.stringify(newMem, null, 2));
      }
    }
  }

  // Test Authentication Login
  console.log(`\n=== Testing Login with New Password ===`);
  const clientAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseServiceKey);
  const { data: signInData, error: signInError } = await clientAuth.auth.signInWithPassword({
    email: targetEmail,
    password: newPassword
  });

  if (signInError) {
    console.error('FAILED LOGIN TEST:', signInError.message);
  } else {
    console.log('SUCCESS! Login test passed with token access.');
    console.log(`User ID logged in: ${signInData.user?.id}`);
    console.log(`Session established successfully!`);
  }
}

resolveUser().catch(console.error);
