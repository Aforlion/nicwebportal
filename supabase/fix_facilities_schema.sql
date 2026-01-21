-- ============================================
-- 1. FIX FACILITIES TABLE SCHEMA
-- ============================================
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS registration_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS facility_type TEXT,
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS tin TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. ENABLE RLS AND POLICIES FOR FACILITIES
-- ============================================
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all facilities" ON facilities;
DROP POLICY IF EXISTS "Owners can manage their own facility" ON facilities;
DROP POLICY IF EXISTS "Owners can update their own facility" ON facilities;
DROP POLICY IF EXISTS "Users can register their own facility" ON facilities;
DROP POLICY IF EXISTS "Public can view active facilities" ON facilities;

-- Admins can do anything
CREATE POLICY "Admins can manage all facilities"
ON facilities FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer', 'inspector')
    )
);

-- Allow new users to REGISTER their facility (INSERT)
CREATE POLICY "Users can register their own facility"
ON facilities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Owners can view their own facility
CREATE POLICY "Owners can manage their own facility"
ON facilities FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Owners can update their own facility
CREATE POLICY "Owners can update their own facility"
ON facilities FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Public can view active facilities
CREATE POLICY "Public can view active facilities"
ON facilities FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- ============================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
-- This ensures the 'profiles' record exists BEFORE any other table tries to reference it via owner_id.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unnamed User'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'member')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. FIX PROFILE RLS (ALLOWING TRIGGER TO WORK)
-- ============================================
-- Ensure profiles can be created even if auth.uid() isn't fully propagated yet in the session context
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile" 
ON profiles FOR INSERT 
WITH CHECK (true); -- Trigger is SECURITY DEFINER, but this helps if frontend still tries manual insert
