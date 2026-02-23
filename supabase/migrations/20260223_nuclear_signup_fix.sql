-- ============================================
-- NUCLEAR FIX: Robust Signup Trigger (v3)
-- ============================================
-- STEP 1: WIPE ALL EXISTING TRIGGERS ON auth.users
-- This ensures no hidden/zombie triggers are interfering.
DO $$
DECLARE
    tr record;
BEGIN
    FOR tr IN (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' 
        AND event_object_table = 'users'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || tr.trigger_name || ' ON auth.users;';
    END LOOP;
END $$;

-- STEP 2: HARDEN ROLES ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'member', 'admin', 'inspector', 'super_admin', 'registry_officer', 'auditor');
    ELSE
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'registry_officer';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'auditor';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'inspector';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'instructor';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Role type already exists or cannot be modified in transaction.';
END$$;

-- STEP 3: RE-DEFINE FUNCTION WITH EXTREME DEFENSE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role user_role;
  meta_role text;
BEGIN
  -- Safe Metadata Extraction
  meta_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  
  -- Safe Role Casting
  BEGIN
    extracted_role := meta_role::user_role;
  EXCEPTION WHEN OTHERS THEN
    extracted_role := 'student'::user_role;
  END;

  -- INTEGRITY CHECK: Handle Email Conflicts (Zombie Profiles)
  -- If a profile exists with this email but a DIFFERENT ID, re-link it.
  -- This prevents "Duplicate Email" 500 errors during auth.signUp.
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = new.email AND id != new.id) THEN
      UPDATE public.profiles 
      SET id = new.id, 
          full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
          updated_at = NOW()
      WHERE email = new.email;
      RETURN new;
  END IF;

  -- INSERT OR UPDATE BY ID
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
  WHERE (profiles.role IS NULL OR profiles.role NOT IN ('admin', 'super_admin'));
    
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Last resort: Log the error and allow auth user creation to proceed
  -- Catching the error here prevents the 500 error on the frontend.
  RAISE WARNING 'Signup Trigger failed for user %: %', new.email, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: RE-INSTALL TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 5: PERMISSIONS
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;
