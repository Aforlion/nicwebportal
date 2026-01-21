-- ============================================
-- Repair LMS Schema (Courses & Enrollments)
-- ============================================

-- 1. Ensure 'courses' table exists
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    duration_hours INTEGER,
    level TEXT DEFAULT 'Beginner',
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure 'enrollments' table exists
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fix 'enrollments' columns (Idempotent)
DO $$
BEGIN
    -- Check/Add course_id
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollments' 
        AND column_name = 'course_id'
    ) THEN
        ALTER TABLE enrollments 
        ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
    END IF;

    -- Check/Add progress
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollments' 
        AND column_name = 'progress'
    ) THEN
        ALTER TABLE enrollments 
        ADD COLUMN progress DECIMAL(5, 2) DEFAULT 0.00;
    END IF;

    -- Check/Add status
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollments' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE enrollments 
        ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Check/Add completed_at
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollments' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE enrollments 
        ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;

    -- Ensure UNIQUE constraint
    BEGIN
        ALTER TABLE enrollments
        ADD CONSTRAINT enrollments_user_id_course_id_key UNIQUE (user_id, course_id);
    EXCEPTION WHEN duplicate_object THEN 
        NULL;
    WHEN others THEN 
        NULL;
    END;

END $$;
