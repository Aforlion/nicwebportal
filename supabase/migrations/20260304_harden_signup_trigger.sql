-- ============================================
-- HARDENED Signup Trigger (v4)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role user_role;
  meta_role text;
BEGIN
  -- Safe Metadata Extraction
  meta_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  
  -- HARDENING: Prevent role escalation via metadata
  -- Only allow 'student' or 'member' from public signup
  IF meta_role NOT IN ('student', 'member') THEN
    meta_role := 'student';
  END IF;

  -- Safe Role Casting
  BEGIN
    extracted_role := meta_role::user_role;
  EXCEPTION WHEN OTHERS THEN
    extracted_role := 'student'::user_role;
  END;

  -- INTEGRITY CHECK: Handle Email Conflicts (Zombie Profiles)
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
  RAISE WARNING 'Signup Trigger failed for user %: %', new.email, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
