-- ============================================
-- Admin Setup Script for Olatunji Joel
-- ============================================
-- Run this script AFTER creating your account via the signup page

-- Step 1: Find your user ID (replace the email with yours if different)
-- This query will show your user ID
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'aforlion007@gmail.com';

-- Step 2: Update your profile to admin role
-- Copy your user ID from Step 1 and use it here
UPDATE profiles 
SET role = 'admin'
WHERE email = 'aforlion007@gmail.com';

-- Step 3: Verify the update
SELECT id, full_name, email, role 
FROM profiles 
WHERE email = 'aforlion007@gmail.com';

-- ============================================
-- Alternative: If you want to do it in one step
-- ============================================
-- This updates the profile to admin for the user with your email
UPDATE profiles 
SET role = 'admin'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'aforlion007@gmail.com'
);

-- Verify
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.role,
    p.created_at
FROM profiles p
WHERE p.email = 'aforlion007@gmail.com';
