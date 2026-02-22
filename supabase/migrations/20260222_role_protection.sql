-- ============================================
-- Security Hardening: Role Escalation Prevention
-- ============================================
-- This script adds a trigger to ensure that only authorized administrative 
-- users can update the 'role' column on the profiles table.

CREATE OR REPLACE FUNCTION protect_role_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- If the role is being changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- Check if the current user performing the update is an admin
        -- We use auth.uid() to find the performer's profile
        IF NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        ) THEN
            -- If not an admin, revert the role to its old value
            -- Alternatively, we could RAISE EXCEPTION to block the update entirely
            -- RAISE EXCEPTION 'Unauthorized role change attempt.';
            NEW.role := OLD.role;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger (ensure it runs after any other BEFORE UPDATE triggers)
DROP TRIGGER IF EXISTS tr_protect_role_updates ON profiles;
CREATE TRIGGER tr_protect_role_updates
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_role_updates();
