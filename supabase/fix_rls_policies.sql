-- ============================================
-- Fix RLS Policies for Signup
-- ============================================
-- This script fixes the Row Level Security policies to allow
-- users to create their own profiles during signup

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can edit their own profile." ON profiles;

-- Recreate policies with proper permissions

-- 1. Allow everyone to view profiles (public verification)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- 2. Allow authenticated users to INSERT their own profile (signup)
CREATE POLICY "Users can create their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
