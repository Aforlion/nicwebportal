-- ========================================================
-- Phase 2: Institutional Training, Accreditation & Certificates
-- ========================================================

-- 1. Extend Facilities Table with Accreditation details
ALTER TABLE public.facilities 
ADD COLUMN IF NOT EXISTS accreditation_level TEXT, -- level_1 (Registered), level_2 (Accredited), level_3 (Centre of Excellence)
ADD COLUMN IF NOT EXISTS institution_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS accreditation_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS curriculum_status TEXT DEFAULT 'none', -- none, pending_review, approved, rejected
ADD COLUMN IF NOT EXISTS curriculum_url TEXT;

-- 2. Extend Profiles to support Instructors and Student-Institution linking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_approved_instructor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS training_facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- 3. Create Internships Table
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    custom_facility_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    certificate_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Internships
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own internships" 
ON public.internships FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view and edit all internships" 
ON public.internships FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer')
    )
);

CREATE POLICY "Facilities can view their interns"
ON public.internships FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.facilities
        WHERE facilities.id = internships.facility_id
        AND facilities.owner_id = auth.uid()
    )
);

-- 4. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fundamental', 'advanced', 'internship', 'ncna', 'accreditation', 'curriculum')),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    verification_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for Certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certificate verification records" 
ON public.certificates FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Admins can issue and manage all certificates" 
ON public.certificates FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer')
    )
);
