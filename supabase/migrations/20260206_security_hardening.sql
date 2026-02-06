-- ============================================
-- Security Hardening: Unified RLS Policy Fixes
-- ============================================
-- This script standardizes administrative access across all tables
-- to include super_admin, registry_officer, inspector, and auditor roles.

-- 1. PROFILES Table
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" 
ON profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer')
    )
);

-- 2. MEMBERSHIPS Table
DROP POLICY IF EXISTS "Admins can view all memberships" ON memberships;
CREATE POLICY "Admins can view all memberships" ON memberships
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer')
    )
);

-- 3. PROGRAMS/COURSES Tables
-- (LMS uses 'courses', legacy might use 'programs')
DROP POLICY IF EXISTS "Admins manage courses" ON courses;
CREATE POLICY "Admins manage courses" ON courses 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'registry_officer')
    )
);

-- 4. MODULES/LESSONS Tables
DROP POLICY IF EXISTS "Admins manage modules" ON modules;
CREATE POLICY "Admins manage modules" ON modules 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'registry_officer')
    )
);

DROP POLICY IF EXISTS "Admins manage lessons" ON lessons;
CREATE POLICY "Admins manage lessons" ON lessons 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'registry_officer')
    )
);

-- 5. CPD ACTIVITIES Table
DROP POLICY IF EXISTS "Admins can manage all CPD activities" ON cpd_activities;
CREATE POLICY "Admins can manage all CPD activities" ON cpd_activities
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer')
    )
);

-- 6. DISCIPLINARY RECORDS Table
DROP POLICY IF EXISTS "Only admins can access disciplinary records" ON disciplinary_records;
CREATE POLICY "Admins can access disciplinary records" ON disciplinary_records
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer')
    )
);

-- 7. NEWS & PUBLICATIONS (If exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'news') THEN
        ALTER TABLE news ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Admins manage news" ON news;
        CREATE POLICY "Admins manage news" ON news FOR ALL USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
        );
    END IF;
END $$;
