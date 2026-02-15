-- ============================================
-- Phase 1: Add Instructor Role
-- Run this script first and COMMIT before running Phase 2.
-- ============================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'instructor';
