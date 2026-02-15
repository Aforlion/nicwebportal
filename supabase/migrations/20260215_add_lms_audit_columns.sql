-- Add audit columns to LMS tables
ALTER TABLE modules ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Update RLS if needed (usually admins manage these, and existing policies cover them, 
-- but we might want to ensure instructors can only edit their own or similar in the future)
-- For now, we just add the columns to track the data.
