-- Fix Enrollments Table Schema
DO $$
BEGIN
    -- 1. Add payment_reference column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'payment_reference'
    ) THEN
        ALTER TABLE enrollments ADD COLUMN payment_reference TEXT;
    END IF;

    -- 2. Add completed_lessons column (JSONB array to track lesson IDs)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'completed_lessons'
    ) THEN
        ALTER TABLE enrollments ADD COLUMN completed_lessons JSONB DEFAULT '[]';
    END IF;

    -- 3. Ensure progress has correct scale
    -- (The previous migration used DECIMAL(5,2), which is fine, but let's ensure it exists)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'progress'
    ) THEN
        ALTER TABLE enrollments ADD COLUMN progress DECIMAL(5, 2) DEFAULT 0.00;
    END IF;

END $$;
