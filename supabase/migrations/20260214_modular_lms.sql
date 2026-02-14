-- ============================================
-- Modular LMS Refactoring
-- Enabling many-to-many relationship between Courses and Modules
-- ============================================

-- 1. Create course_modules junction table
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, module_id)
);

-- 2. Enable RLS
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for course_modules
CREATE POLICY "Public view course_modules" ON course_modules FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_modules.course_id AND is_published = true)
);

CREATE POLICY "Admins manage course_modules" ON course_modules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer'))
);

-- 4. Migrate existing data
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='course_id') THEN
        INSERT INTO course_modules (course_id, module_id, sort_order)
        SELECT course_id, id, sort_order FROM modules WHERE course_id IS NOT NULL
        ON CONFLICT (course_id, module_id) DO NOTHING;
        
        -- Make old columns nullable first to avoid breaking logic if still in use
        ALTER TABLE modules ALTER COLUMN course_id DROP NOT NULL;
    END IF;
END $$;

-- 5. Update Policies for Lessons
-- Lessons should be viewable if any linked course is published
DROP POLICY IF EXISTS "Public view lessons" ON lessons;
CREATE POLICY "Public view lessons modular" ON lessons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM modules 
        JOIN course_modules ON modules.id = course_modules.module_id
        JOIN courses ON course_modules.course_id = courses.id
        WHERE modules.id = lessons.module_id AND courses.is_published = true
    )
);
