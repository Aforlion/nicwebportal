-- ============================================
-- SQL Fix: Restore Trigger & Fix Facility RLS (v2)
-- ============================================

-- 1. Restore Robust handle_new_user Trigger
-- This ensures a profile is created INSTANTLY on signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role public.user_role;
  meta_role text;
BEGIN
  -- Safe Metadata Extraction
  meta_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  
  -- Safe Role Casting
  BEGIN
    extracted_role := meta_role::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    extracted_role := 'student'::public.user_role;
  END;

  -- Handle Email Conflicts (Zombie Profiles)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = new.email AND id != new.id) THEN
      UPDATE public.profiles 
      SET id = new.id, 
          full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
          updated_at = NOW()
      WHERE email = new.email;
      RETURN new;
  END IF;

  -- Insert Profile
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    new.email,
    extracted_role,
    COALESCE(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW()
  WHERE (profiles.role IS NULL OR profiles.role NOT IN ('admin', 'super_admin'));
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-install Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Profiles RLS Hardening
-- Ensure an authenticated user can (re)create their own profile if the trigger had a race condition
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 3. Facilities RLS Hardening
-- Allow authenticated owners to insert their own facility
DROP POLICY IF EXISTS "Users can register their own facility" ON public.facilities;
CREATE POLICY "Users can register their own facility"
ON public.facilities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Ensure owners can see their own facility even if pending
DROP POLICY IF EXISTS "Owners can view their own facility" ON public.facilities;
CREATE POLICY "Owners can view their own facility"
ON public.facilities FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- 4. Permissions
GRANT ALL ON public.profiles TO service_role, postgres;
GRANT ALL ON public.facilities TO service_role, postgres;

