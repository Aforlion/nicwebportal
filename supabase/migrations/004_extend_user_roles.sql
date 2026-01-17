-- 1. Update User Roles
-- We add granular admin roles to the existing enum
-- Note: 'admin' will be treated as 'super_admin' conceptually for now
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'registry_officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'auditor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'inspector';

