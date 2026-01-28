-- DISABLE FAILING TRIGGER
-- This removes the automatic profile creation trigger to preventing the 500 Error.
-- The frontend now handles profile creation manually.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
