-- ============================================
-- HYPER-DIAGNOSTIC: Find the Real Signup Error
-- ============================================

-- 1. Create a dedicated logging table to capture the hidden error
CREATE TABLE IF NOT EXISTS public.signup_errors (
    id SERIAL PRIMARY KEY,
    email TEXT,
    error_message TEXT,
    error_detail TEXT,
    error_hint TEXT,
    context TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grant access so trigger can write here
GRANT INSERT ON public.signup_errors TO postgres, service_role;

-- 3. Replace the trigger with a Trace/Diagnostic version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role text;
BEGIN
  BEGIN
    -- STEP A: Log that we started (Diagnostic point)
    INSERT INTO public.signup_errors (email, error_message) VALUES (new.email, 'TRIGGER STARTED');

    -- STEP B: Attempt the Profile Insertion
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', 'New User'), 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'role', 'student')::public.user_role
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

    -- STEP C: Log Success
    INSERT INTO public.signup_errors (email, error_message) VALUES (new.email, 'TRIGGER COMPLETED SUCCESSFULLY');

  EXCEPTION WHEN OTHERS THEN
    -- STEP D: Capture the ACTUAL ERROR that is currently causing the 500
    INSERT INTO public.signup_errors (email, error_message, error_detail, context)
    VALUES (
        new.email, 
        SQLERRM, 
        SQLSTATE,
        'Inside handle_new_user exception block'
    );
    -- CRITICAL: Return NEW anyway. 
    -- If the profile insert failed, catching it here SHOULD stop the 500 error.
    -- If the 500 PERSISTS, the error is NOT in this function.
    RETURN new;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Clean and Reinstall single trigger
DO $$
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_auth_user_created_google ON auth.users;
    DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Diagnostic: List all triggers to confirm cleanup worked
-- (This doesn't help the UI but helps if the user checks their dashboard result)
SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE event_object_table = 'users';
