-- ============================================
-- Fix Assessments Table Schema & RLS
-- ============================================

-- 1. Add missing columns
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- 2. Add unique constraint to lesson_id
-- This ensures each lesson can only have ONE assessment/quiz.
-- First, remove any potential duplicates (keeping the most recent)
DELETE FROM assessments a
WHERE a.id NOT IN (
    SELECT DISTINCT ON (lesson_id) id
    FROM assessments
    ORDER BY lesson_id, created_at DESC
);

ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_lesson_id_key;
ALTER TABLE assessments ADD CONSTRAINT assessments_lesson_id_key UNIQUE (lesson_id);

-- 3. Update RLS policies to include all administrative roles
-- The code in auth.ts includes: 'admin', 'super_admin', 'registry_officer', 'inspector', 'auditor', 'instructor'
DROP POLICY IF EXISTS "Admins manage assessments" ON assessments;
CREATE POLICY "Admins manage assessments" ON assessments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'registry_officer', 'instructor', 'inspector', 'auditor')
    )
);

-- 4. Enable updated_at trigger (optional but recommended)
-- Assuming the 'update_updated_at_column' function exists from schema.sql
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
