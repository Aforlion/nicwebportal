-- ============================================
-- KILL SWITCH TEST: Disable All Auth Triggers
-- ============================================

-- 1. Disable the triggers
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- 2. Verify they are disabled
SELECT trigger_name, enabled 
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- 3. Instruction: 
-- Try the registration now. 
-- If it WORKS, the problem is one of the triggers.
-- If it STILL FAILS, the problem is in your Supabase Auth / SMTP configuration.

-- 4. Re-enable (Run this AFTER testing)
-- ALTER TABLE auth.users ENABLE TRIGGER ALL;
