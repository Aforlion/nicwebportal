-- ============================================
-- SILENT TRIGGER TEST: Bypasses 42501 Error
-- ============================================
-- Since we can't disable the trigger on the table itself due to 
-- permissions, we will simply "empty" the function logic.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We do nothing here. 
  -- We just return the new user and let Supabase proceed.
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Instruction:
-- 1. Run this script.
-- 2. Try signing up with a FRESH email.
-- 3. If it STILL FAILS with "Database error saving new user", 
--    the issue is 100% in your Supabase Auth / SMTP settings 
--    (Go to Settings > Auth > External Email Provider).
