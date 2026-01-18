-- Add TIN column to facilities table
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS tin TEXT;
