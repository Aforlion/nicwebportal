-- ============================================
-- NIC Membership Management System - Schema Migration
-- ============================================
-- This migration adds tables for the membership management system
-- while integrating with existing profiles and memberships tables

-- ============================================
-- 1. UPDATE EXISTING MEMBERSHIPS TABLE
-- ============================================
-- Add missing columns to existing memberships table
ALTER TABLE memberships 
  ADD COLUMN IF NOT EXISTS member_id TEXT UNIQUE, -- Alternative to nic_id for consistency
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending', -- pending, active, suspended, expired
  ADD COLUMN IF NOT EXISTS joined_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger for updated_at
CREATE TRIGGER update_memberships_updated_at 
  BEFORE UPDATE ON memberships 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_nic_id ON memberships(nic_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_category ON memberships(category);

-- Update RLS policies for memberships
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own membership" ON memberships;
CREATE POLICY "Users can view their own membership" ON memberships
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own membership" ON memberships;
CREATE POLICY "Users can update their own membership" ON memberships
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all memberships" ON memberships;
CREATE POLICY "Admins can view all memberships" ON memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 2. PAYMENTS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL, -- annual_dues, renewal, late_fee
  payment_method TEXT, -- paystack, bank_transfer, cash
  
  -- Transaction Info
  transaction_reference TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_date TIMESTAMPTZ,
  
  -- Receipt
  receipt_number TEXT UNIQUE,
  receipt_url TEXT,
  
  -- Period Covered
  period_start DATE,
  period_end DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_membership_id ON payments(membership_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Trigger
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (
    membership_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 3. DOCUMENTS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
  
  -- Document Details
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- certificate, identification, photo, cpd, other
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  
  -- Verification
  status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_membership_id ON documents(membership_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own documents" ON documents
  FOR ALL USING (
    membership_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 4. CPD ACTIVITIES TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS cpd_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
  
  -- Activity Details
  title TEXT NOT NULL,
  provider TEXT,
  activity_type TEXT, -- training, workshop, seminar, self_study, conference
  description TEXT,
  
  -- Points and Duration
  points INTEGER NOT NULL,
  duration_hours DECIMAL(5, 2),
  activity_date DATE NOT NULL,
  
  -- Certificate
  certificate_url TEXT,
  
  -- Approval
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cpd_membership_id ON cpd_activities(membership_id);
CREATE INDEX idx_cpd_status ON cpd_activities(status);
CREATE INDEX idx_cpd_activity_date ON cpd_activities(activity_date);

-- Trigger
CREATE TRIGGER update_cpd_activities_updated_at 
  BEFORE UPDATE ON cpd_activities 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS
ALTER TABLE cpd_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own CPD activities" ON cpd_activities
  FOR ALL USING (
    membership_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all CPD activities" ON cpd_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 5. DISCIPLINARY RECORDS TABLE (NEW - Admin Only)
-- ============================================
CREATE TABLE IF NOT EXISTS disciplinary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
  
  -- Incident Details
  incident_date DATE NOT NULL,
  incident_type TEXT, -- complaint, violation, misconduct, other
  description TEXT NOT NULL,
  severity TEXT, -- minor, moderate, severe
  
  -- Action Taken
  action_taken TEXT,
  action_date DATE,
  
  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolved_date DATE,
  resolution_notes TEXT,
  
  -- Admin Info
  reported_by UUID REFERENCES profiles(id),
  handled_by UUID REFERENCES profiles(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_disciplinary_membership_id ON disciplinary_records(membership_id);
CREATE INDEX idx_disciplinary_resolved ON disciplinary_records(resolved);

-- Trigger
CREATE TRIGGER update_disciplinary_records_updated_at 
  BEFORE UPDATE ON disciplinary_records 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS (Admin only)
ALTER TABLE disciplinary_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access disciplinary records" ON disciplinary_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 6. MEMBERSHIP APPLICATIONS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Applicant Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT,
  
  -- Professional Information
  qualification TEXT,
  years_of_experience INTEGER,
  
  -- Membership Category
  membership_category membership_category NOT NULL,
  
  -- Application Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Payment
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_applications_status ON membership_applications(status);
CREATE INDEX idx_applications_email ON membership_applications(email);

-- Trigger
CREATE TRIGGER update_membership_applications_updated_at 
  BEFORE UPDATE ON membership_applications 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create applications" ON membership_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own applications" ON membership_applications
  FOR SELECT USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all applications" ON membership_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- SUMMARY
-- ============================================
-- Modified Tables: 1
--   - memberships (added columns for member details)
--
-- New Tables: 5
--   - payments
--   - documents
--   - cpd_activities
--   - disciplinary_records
--   - membership_applications
--
-- All tables integrate with existing profiles table
-- All tables use existing user_role and membership_category enums
