-- ============================================
-- Phase 3: Facility Module & RBAC Policies
-- ============================================

-- 1. Create Facilities Table
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    facility_type TEXT, -- nursing_home, hospital, agency, etc.
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    state TEXT,
    city TEXT,
    capacity INTEGER,
    status TEXT DEFAULT 'pending', -- pending, active, suspended, revoked
    compliance_score INTEGER DEFAULT 0,
    last_inspection_date TIMESTAMPTZ,
    next_inspection_date TIMESTAMPTZ,
    owner_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure status column exists if table was previously created without it
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';


-- 2. Create Facility Staff Table (Links Caregivers to Facilities)
CREATE TABLE IF NOT EXISTS facility_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
    position TEXT, -- caregiver, supervisor, clinical_lead, etc.
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    added_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(facility_id, membership_id)
);

-- 3. RLS Policies for Facilities
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins can manage all facilities"
ON facilities FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer', 'inspector')
    )
);

-- Owners can view and update their own facility
CREATE POLICY "Owners can manage their own facility"
ON facilities FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Owners can update their own facility"
ON facilities FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Public can view active facilities
CREATE POLICY "Public can view active facilities"
ON facilities FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- 4. RLS Policies for Facility Staff
ALTER TABLE facility_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all facility staff"
ON facility_staff FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer')
    )
);

CREATE POLICY "Facility owners can manage their staff"
ON facility_staff FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM facilities
        WHERE facilities.id = facility_staff.facility_id
        AND facilities.owner_id = auth.uid()
    )
);

CREATE POLICY "Caregivers can view their own affiliations"
ON facility_staff FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM memberships
        WHERE memberships.id = facility_staff.membership_id
        AND memberships.user_id = auth.uid()
    )
);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
