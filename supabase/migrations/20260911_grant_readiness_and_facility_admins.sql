-- ============================================================
-- NIC Portal Grant Readiness & Facility Admin Migration
-- Migration ID: 20260911_grant_readiness_and_facility_admins
-- ============================================================

-- 1. ADD DEMOGRAPHIC COLUMNS TO PROFILES (FOR PROGRESSIVE PROFILING)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS state_of_origin TEXT,
  ADD COLUMN IF NOT EXISTS lga TEXT,
  ADD COLUMN IF NOT EXISTS education_level TEXT;

-- 2. ENROLLMENT PROFILE GATE TRACKING
ALTER TABLE enrollments 
  ADD COLUMN IF NOT EXISTS profile_gate_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gated_at TIMESTAMPTZ;

-- 3. CAREGIVER CAREER PATHWAYS & TRANSITION TABLE
CREATE TABLE IF NOT EXISTS caregiver_career_pathways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Origin & Transition Background (Captured at Certificate Gate)
    entry_category TEXT NOT NULL DEFAULT 'FRESH_STARTER', -- 'FRESH_STARTER', 'CAREER_SWITCHER', 'UNEMPLOYED_CAREGIVER', 'PRACTICING_CAREGIVER'
    prior_industry TEXT,          -- e.g. 'Education', 'Hospitality', 'Retail', 'Civil Service', 'Informal Sector', 'None'
    prior_occupation TEXT,        -- e.g. 'Primary Teacher', 'Sales Clerk', 'N/A'
    pre_training_monthly_income TEXT, -- '₦0', '<₦50k', '₦50k-₦100k', '₦100k+'
    
    -- Post-Certification Outcome
    current_employment_status TEXT DEFAULT 'UNEMPLOYED_SEEKING', -- 'EMPLOYED_FULLTIME', 'EMPLOYED_PARTTIME', 'SELF_EMPLOYED', 'UNEMPLOYED_SEEKING'
    employer_name TEXT,
    facility_type TEXT,            -- 'Hospital', 'Home_Care_Agency', 'Nursing_Home', 'Private_Client'
    post_training_monthly_income TEXT, -- '₦100k-₦200k', '₦200k-₦350k', '₦350k+'
    placement_lead_time_days INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for caregiver_career_pathways
ALTER TABLE caregiver_career_pathways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own career pathway" 
  ON caregiver_career_pathways FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own career pathway" 
  ON caregiver_career_pathways FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all career pathways" 
  ON caregiver_career_pathways FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 4. FACILITY EXTENSIONS & FACILITY ADMIN TABLE
ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS bed_capacity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_caregiver_staff INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_hiring_need INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS facility_category TEXT DEFAULT 'Private_Hospital';

CREATE TABLE IF NOT EXISTS facility_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  official_title TEXT NOT NULL, -- 'HR Director', 'Chief Nursing Officer', 'Managing Director'
  verification_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
  can_sign_internships BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_id, user_id)
);

-- RLS for facility_admins
ALTER TABLE facility_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility admins can view their assigned facility mapping" 
  ON facility_admins FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all facility admins" 
  ON facility_admins FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 5. INDEXES FOR FAST ANALYTICS
CREATE INDEX IF NOT EXISTS idx_career_pathways_entry ON caregiver_career_pathways(entry_category);
CREATE INDEX IF NOT EXISTS idx_career_pathways_status ON caregiver_career_pathways(current_employment_status);
CREATE INDEX IF NOT EXISTS idx_facility_admins_facility ON facility_admins(facility_id);
