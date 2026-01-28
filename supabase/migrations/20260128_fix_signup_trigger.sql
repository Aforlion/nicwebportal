-- 1. Fix User Role Enum (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'member', 'admin', 'inspector');
    END IF;
END$$;

-- 2. Drop existing trigger and function to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Recreate Function with robust handling and explicit casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role user_role;
BEGIN
  -- Safe casting logic for role
  BEGIN
    extracted_role := COALESCE(new.raw_user_meta_data->>'role', 'member')::user_role;
  EXCEPTION WHEN OTHERS THEN
    extracted_role := 'member'::user_role;
  END;

  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unnamed User'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    extracted_role
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
