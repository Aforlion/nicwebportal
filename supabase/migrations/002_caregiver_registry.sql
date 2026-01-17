-- ============================================
-- National Caregiver Registry - Database Migration
-- Phase 1: Enhanced Verification
-- ============================================

-- ============================================
-- 1. CAREGIVER CERTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS caregiver_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
    
    -- Certificate Details
    certificate_number TEXT UNIQUE NOT NULL,
    certificate_type TEXT NOT NULL, -- HCA, Specialty Care, Advanced, etc.
    certificate_name TEXT NOT NULL,
    
    -- Dates
    issue_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Verification
    is_valid BOOLEAN DEFAULT true,
    verification_code TEXT UNIQUE, -- For QR code
    qr_code_url TEXT,
    
    -- Issuer
    issued_by TEXT,
    issuing_institution TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_certifications_membership_id ON caregiver_certifications(membership_id);
CREATE INDEX idx_certifications_certificate_number ON caregiver_certifications(certificate_number);
CREATE INDEX idx_certifications_verification_code ON caregiver_certifications(verification_code);

-- ============================================
-- 2. REGISTRY ACTIONS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS registry_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target
    target_type TEXT NOT NULL, -- caregiver, facility
    target_id UUID NOT NULL,
    
    -- Action
    action_type TEXT NOT NULL, -- suspend, revoke, reinstate, approve, reject
    reason TEXT NOT NULL,
    notes TEXT,
    
    -- Actor
    performed_by UUID REFERENCES profiles(id),
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional Data
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_registry_actions_target ON registry_actions(target_type, target_id);
CREATE INDEX idx_registry_actions_performed_by ON registry_actions(performed_by);
CREATE INDEX idx_registry_actions_performed_at ON registry_actions(performed_at);

-- ============================================
-- 3. VERIFICATION LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Search Details
    search_type TEXT NOT NULL, -- name, nic_id, certificate_number, qr_code
    search_query TEXT NOT NULL,
    
    -- Result
    result_found BOOLEAN NOT NULL,
    result_id UUID, -- membership_id if found
    
    -- Request Info
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamp
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verification_logs_verified_at ON verification_logs(verified_at);
CREATE INDEX idx_verification_logs_result_id ON verification_logs(result_id);

-- ============================================
-- 4. UPDATE MEMBERSHIPS TABLE
-- ============================================
-- Add compliance and status fields
ALTER TABLE memberships 
    ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'compliant', -- compliant, under_review, suspended, revoked
    ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
    ADD COLUMN IF NOT EXISTS suspension_date DATE,
    ADD COLUMN IF NOT EXISTS revocation_reason TEXT,
    ADD COLUMN IF NOT EXISTS revocation_date DATE,
    ADD COLUMN IF NOT EXISTS cpd_compliant BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS last_cpd_check DATE;

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

-- Caregiver Certifications
ALTER TABLE caregiver_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view valid certifications" 
ON caregiver_certifications FOR SELECT 
USING (is_valid = true);

CREATE POLICY "Members can view their own certifications" 
ON caregiver_certifications FOR SELECT 
USING (
    membership_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all certifications" 
ON caregiver_certifications FOR ALL 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Registry Actions (Admin only)
ALTER TABLE registry_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view registry actions" 
ON registry_actions FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Only admins can create registry actions" 
ON registry_actions FOR INSERT 
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Verification Logs (Public insert, admin view)
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log verifications" 
ON verification_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view verification logs" 
ON verification_logs FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'VER-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
END;
$$ LANGUAGE plpgsql;

-- Function to check CPD compliance
CREATE OR REPLACE FUNCTION check_cpd_compliance(membership_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_points INTEGER;
    required_points INTEGER := 20; -- Adjust as needed
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO total_points
    FROM cpd_activities
    WHERE membership_id = membership_uuid
      AND status = 'approved'
      AND activity_date >= CURRENT_DATE - INTERVAL '1 year';
    
    RETURN total_points >= required_points;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Add sample certifications for existing members
-- INSERT INTO caregiver_certifications (
--     membership_id,
--     certificate_number,
--     certificate_type,
--     certificate_name,
--     issue_date,
--     expiry_date,
--     verification_code
-- )
-- SELECT 
--     id,
--     'CERT-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 6, '0'),
--     'HCA',
--     'Healthcare Assistant Certificate',
--     CURRENT_DATE - INTERVAL '6 months',
--     CURRENT_DATE + INTERVAL '2 years',
--     generate_verification_code()
-- FROM memberships
-- WHERE status = 'active'
-- LIMIT 10;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('caregiver_certifications', 'registry_actions', 'verification_logs');

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('caregiver_certifications', 'registry_actions', 'verification_logs');

-- Check membership table updates
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'memberships' 
AND column_name IN ('compliance_status', 'cpd_compliant');
