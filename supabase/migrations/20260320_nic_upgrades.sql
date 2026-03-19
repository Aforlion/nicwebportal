-- NIC Upgrades Migration: Education & Accreditation

-- 1. Update Programs Table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS level INTEGER CHECK (level >= 1 AND level <= 4),
ADD COLUMN IF NOT EXISTS cpd_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialization TEXT;

-- 2. Update Facilities Table
ALTER TABLE public.facilities
ADD COLUMN IF NOT EXISTS accreditation_level INTEGER CHECK (accreditation_level >= 1 AND accreditation_level <= 3),
ADD COLUMN IF NOT EXISTS license_expiry DATE,
ADD COLUMN IF NOT EXISTS score INTEGER;

-- 3. Create CPD Records Table
CREATE TABLE IF NOT EXISTS public.cpd_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL,
    year INTEGER NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Workshops', 'Courses', 'Practice'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.cpd_records ENABLE ROW LEVEL SECURITY;

-- 4. Create Inspection Scores Table (The 6 Pillars)
CREATE TYPE inspection_pillar AS ENUM (
    'governance', 
    'staffing', 
    'care_practice', 
    'safety', 
    'safeguarding', 
    'documentation'
);

CREATE TABLE IF NOT EXISTS public.inspection_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
    pillar inspection_pillar NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inspection_scores ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function to calculate Accreditation Grade
CREATE OR REPLACE FUNCTION public.calculate_accreditation_grade(total_score INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF total_score >= 85 THEN RETURN 'A';
    ELSIF total_score >= 70 THEN RETURN 'B';
    ELSIF total_score >= 50 THEN RETURN 'C';
    ELSE RETURN 'Fail';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. RLS Policies for CPD Records
CREATE POLICY "Users can view their own CPD records" 
ON public.cpd_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all CPD records" 
ON public.cpd_records FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. RLS Policies for Inspection Scores
CREATE POLICY "Facility owners can view their inspection scores" 
ON public.inspection_scores FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM inspections i
    JOIN facilities f ON i.facility_id = f.id
    WHERE i.id = inspection_id AND f.owner_id = auth.uid()
));

CREATE POLICY "Inspectors and Admins can manage inspection scores" 
ON public.inspection_scores FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'inspector')));
