-- ============================================
-- SQL Fix: Robust Signup Trigger (v2)
-- ============================================
-- This script fixes the "Database error saving new user" (500) during signup
-- by hardening the automatic profile creation trigger.

-- 1. Ensure user_role type exists with ALL current roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'member', 'admin', 'inspector', 'super_admin', 'registry_officer', 'auditor');
    ELSE
        -- Ensure newer roles are present (idempotent adds)
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'registry_officer';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'auditor';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'inspector';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'instructor';
    END IF;
END$$;

-- 2. Drop existing function and trigger for a clean robust definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create Robust Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role user_role;
  meta_role text;
BEGIN
  -- Extract role from metadata safely
  meta_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  
  -- Explicit casting with fallback logic to prevent crash on invalid roles
  BEGIN
    extracted_role := meta_role::user_role;
  EXCEPTION WHEN OTHERS THEN
    extracted_role := 'student'::user_role;
  END;

  -- Insert into profiles with conflict handling
  -- We use ON CONFLICT (id) DO UPDATE to ensure we don't fail if a profile was pre-created
  -- We do NOT update role on conflict to prevent metadata-based escalation of existing profiles
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      'New User'
    ),
    new.email,
    extracted_role,
    COALESCE(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW()
  WHERE profiles.role NOT IN ('admin', 'super_admin'); -- Extra safety check
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach Trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Final Permission Check (Ensures trigger can write to profiles)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;
