-- ============================================
-- RLS Policy Fix for Signup Page
-- ============================================
-- Run this to allow the hidden /signup page to work for admin account creation

-- Add INSERT policy for profiles (allows signup to work)
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles' AND policyname = 'Users can create their own profile';
