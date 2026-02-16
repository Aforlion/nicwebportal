-- Enhance Modules Table
DO $$
BEGIN
    -- 1. Add created_by column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'modules' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE modules ADD COLUMN created_by UUID REFERENCES profiles(id);
    END IF;

    -- 2. Add completion_requirements column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'modules' AND column_name = 'completion_requirements'
    ) THEN
        ALTER TABLE modules ADD COLUMN completion_requirements TEXT;
    END IF;

END $$;
