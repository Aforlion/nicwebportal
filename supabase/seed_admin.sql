-- ============================================
-- COMPLETE ADMIN SETUP - ONE SCRIPT
-- For: Olatunji Joel (aforlion007@gmail.com)
-- ============================================
-- This script creates EVERYTHING in one go:
-- 1. Fixes RLS policies
-- 2. Creates auth user with password
-- 3. Creates profile with admin role
-- 4. Creates membership record

-- ============================================
-- STEP 1: Fix RLS Policies First
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can edit their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Memberships policies
DROP POLICY IF EXISTS "Users can view their own membership" ON memberships;
DROP POLICY IF EXISTS "Users can insert their own membership" ON memberships;
DROP POLICY IF EXISTS "Users can update their own membership" ON memberships;
DROP POLICY IF EXISTS "Admins can view all memberships" ON memberships;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON memberships;

CREATE POLICY "Users can view their own membership" 
ON memberships FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own membership" 
ON memberships FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" 
ON memberships FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all memberships" 
ON memberships FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can manage all memberships" 
ON memberships FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================
-- STEP 2: Create Auth User
-- ============================================
-- IMPORTANT: Replace 'YourSecurePassword123!' with your actual password

-- Create the user in auth.users
-- Note: This uses Supabase's admin API - you may need to do this via Dashboard
-- Go to Authentication > Users > Add User (manually)
-- Email: aforlion007@gmail.com
-- Password: (your choice)
-- Auto Confirm User: YES

-- After creating user via dashboard, get the user ID and continue below
-- OR use this if you have the auth admin extension:

-- INSERT INTO auth.users (
--     instance_id,
--     id,
--     aud,
--     role,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     raw_app_meta_data,
--     raw_user_meta_data,
--     created_at,
--     updated_at,
--     confirmation_token,
--     recovery_token
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     gen_random_uuid(),
--     'authenticated',
--     'authenticated',
--     'aforlion007@gmail.com',
--     crypt('YourSecurePassword123!', gen_salt('bf')),
--     NOW(),
--     '{"provider":"email","providers":["email"]}',
--     '{"full_name":"Olatunji Joel"}',
--     NOW(),
--     NOW(),
--     '',
--     ''
-- );

-- ============================================
-- STEP 3: Create Profile (Run AFTER creating user)
-- ============================================

-- Insert profile with admin role
INSERT INTO profiles (
    id,
    full_name,
    email,
    phone,
    role,
    created_at,
    updated_at
)
SELECT 
    id,
    'Olatunji Joel',
    'aforlion007@gmail.com',
    '08026607071',
    'admin',
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'aforlion007@gmail.com';

-- ============================================
-- STEP 4: Create Membership
-- ============================================

-- Insert membership record
INSERT INTO memberships (
    user_id,
    category,
    nic_id,
    member_id,
    expiry_date,
    is_active,
    status,
    joined_date,
    photo_url,
    address,
    qualification,
    years_of_experience,
    created_at
)
SELECT 
    id,
    'full',
    'NIC-ADMIN-0001',
    'NIC-ADMIN-0001',
    CURRENT_DATE + INTERVAL '1 year',
    true,
    'active',
    CURRENT_DATE,
    NULL,
    'Abuja, Nigeria',
    'Administrator',
    5,
    NOW()
FROM auth.users
WHERE email = 'aforlion007@gmail.com';

-- ============================================
-- STEP 5: Verify Everything
-- ============================================

-- Check auth user
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'aforlion007@gmail.com';

-- Check profile
SELECT id, full_name, email, phone, role, created_at
FROM profiles
WHERE email = 'aforlion007@gmail.com';

-- Check membership
SELECT 
    m.id,
    m.nic_id,
    m.category,
    m.status,
    m.is_active,
    m.expiry_date,
    m.joined_date
FROM memberships m
JOIN profiles p ON m.user_id = p.id
WHERE p.email = 'aforlion007@gmail.com';

-- ============================================
-- FINAL RESULT
-- ============================================
-- You will have:
-- ✅ Auth user: aforlion007@gmail.com
-- ✅ Profile with role: admin
-- ✅ Membership: NIC-ADMIN-0001 (Full Member)
-- ✅ Status: Active
-- ✅ Can login and access both admin and member portals
