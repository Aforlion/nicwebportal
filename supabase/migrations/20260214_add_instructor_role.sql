-- ============================================
-- Add Instructor Role
-- ============================================

-- 1. Add 'instructor' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'instructor';

-- 2. Update LMS RLS Policies to include instructors
-- (Re-applying policies from fix_lms_rls with the new role included)

-- Modules
DROP POLICY IF EXISTS "Admins manage modules" ON modules;
CREATE POLICY "Admins manage modules" ON modules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer', 'instructor'))
);

-- Lessons
DROP POLICY IF EXISTS "Admins manage lessons" ON lessons;
CREATE POLICY "Admins manage lessons" ON lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer', 'instructor'))
);

-- Assessments
DROP POLICY IF EXISTS "Admins manage assessments" ON assessments;
CREATE POLICY "Admins manage assessments" ON assessments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer', 'instructor'))
);

-- course_modules (junction table)
DROP POLICY IF EXISTS "Admins manage course_modules" ON course_modules;
CREATE POLICY "Admins manage course_modules" ON course_modules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer', 'instructor'))
);
