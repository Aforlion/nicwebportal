-- ============================================
-- SECURITY HARDENING: RLS & ROLE INTEGRITY
-- ============================================

-- 1. HARDEN PROFILES TABLE
-- Current leak: Users could INSERT any profile, potentially spoofing roles.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Prevent non-admins from updating their own role
-- We'll use a trigger for this as RLS 'WITH CHECK' can be bypassed by some update patterns
CREATE OR REPLACE FUNCTION protect_profile_roles()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.role IS DISTINCT FROM NEW.role) AND 
       NOT EXISTS (
           SELECT 1 FROM profiles 
           WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
       ) THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_roles ON profiles;
CREATE TRIGGER tr_protect_profile_roles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION protect_profile_roles();

-- 2. HARDEN PROGRAMS TABLE
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published programs are viewable by everyone." ON programs;
CREATE POLICY "Anyone can view published programs" 
ON programs FOR SELECT 
USING (is_published = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'instructor')
));

CREATE POLICY "Admins/Instructors can manage programs" 
ON programs FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'instructor')
));

-- 3. HARDEN ENROLLMENTS TABLE
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own enrollments." ON enrollments;
CREATE POLICY "Users can view own enrollments" 
ON enrollments FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

CREATE POLICY "Users can enroll themselves" 
ON enrollments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage enrollments" 
ON enrollments FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

-- 4. HARDEN MEMBERSHIPS TABLE
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own membership" ON memberships;
CREATE POLICY "Users can view own membership" 
ON memberships FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer')
));

CREATE POLICY "Admins manage memberships" 
ON memberships FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer')
));

-- 5. HARDEN CERTIFICATES TABLE
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" 
ON certificates FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

CREATE POLICY "Admins manage certificates" 
ON certificates FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'instructor')
));

-- 6. INDEXING FOR PERFORMANCE/DOS PROTECTION
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_facilities_owner_id ON facilities(owner_id);
