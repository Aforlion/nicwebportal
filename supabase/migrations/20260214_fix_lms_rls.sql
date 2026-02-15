-- ============================================
-- Fix LMS RLS Policies for Admin Management
-- ============================================

-- 1. Modules: Add Admin Management
DROP POLICY IF EXISTS "Admins manage modules" ON modules;
CREATE POLICY "Admins manage modules" ON modules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer'))
);

-- 2. Lessons: Add Admin Management
DROP POLICY IF EXISTS "Admins manage lessons" ON lessons;
CREATE POLICY "Admins manage lessons" ON lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer'))
);

-- 3. Assessments: Add Admin Management
DROP POLICY IF EXISTS "Admins manage assessments" ON assessments;
CREATE POLICY "Admins manage assessments" ON assessments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer'))
);

-- 4. Ensure Public View for Modules (Modular structure)
-- Modules should be viewable if they belong to a published course
DROP POLICY IF EXISTS "Public view modules" ON modules;
CREATE POLICY "Public view modules modular" ON modules FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM course_modules 
        JOIN courses ON course_modules.course_id = courses.id 
        WHERE course_modules.module_id = modules.id AND courses.is_published = true
    )
);
