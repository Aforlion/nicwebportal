-- ============================================
-- SQL Migration: Add Grading Rubric to Assessments
-- ============================================

-- Add grading_rubric column to public.assessments table
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS grading_rubric TEXT;
