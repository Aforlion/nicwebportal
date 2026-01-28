-- COMPREHENSIVE FIX FOR REGISTRATION & PROFILES
-- Run this in Supabase SQL Editor

-- 1. Ensure user_role type exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'member', 'admin', 'inspector');
    END IF;
END$$;

-- 2. Drop existing triggers to avoid conflicts/recursion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create a Robust Function for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role user_role;
  meta_role text;
BEGIN
  -- Extract role from metadata safely
  meta_role := new.raw_user_meta_data->>'role';
  
  -- Logic to convert text to enum safely
  IF meta_role IS NULL THEN
     extracted_role := 'member';
  ELSIF meta_role = 'student' THEN
     extracted_role := 'student';
  ELSIF meta_role = 'admin' THEN
     extracted_role := 'member'; -- Default admins to member first, upgrade manually
  ELSIF meta_role = 'inspector' THEN
     extracted_role := 'inspector';
  ELSE
     extracted_role := 'member';
  END IF;

  -- Insert Profile
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    extracted_role,
    COALESCE(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant Permissions (Fixes possible 500s due to RLS/Perms)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.pending_registrations TO anon, authenticated, service_role;

-- 6. Add Recapitalization Column (Idempotent check, just in case)
ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS paid_recapitalization BOOLEAN DEFAULT FALSE;
