-- Create accreditation_applications table
CREATE TABLE IF NOT EXISTS public.accreditation_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    application_data JSONB NOT NULL,
    status TEXT DEFAULT 'submitted', -- submitted, under_review, approved, rejected
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for accreditation_applications
ALTER TABLE public.accreditation_applications ENABLE ROW LEVEL SECURITY;

-- Admins and inspectors can do anything
CREATE POLICY "Admins/inspectors can manage all applications"
ON public.accreditation_applications FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'registry_officer', 'inspector')
    )
);

-- Facility owners can view their own applications
CREATE POLICY "Facility owners can view their own applications"
ON public.accreditation_applications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.facilities
        WHERE facilities.id = accreditation_applications.facility_id
        AND facilities.owner_id = auth.uid()
    )
);

-- Facility owners can insert their own applications
CREATE POLICY "Facility owners can insert their own applications"
ON public.accreditation_applications FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.facilities
        WHERE facilities.id = facility_id
        AND facilities.owner_id = auth.uid()
    )
);

-- Facility owners can update their own applications
CREATE POLICY "Facility owners can update their own applications"
ON public.accreditation_applications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.facilities
        WHERE facilities.id = accreditation_applications.facility_id
        AND facilities.owner_id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_accreditation_applications_updated_at
    BEFORE UPDATE ON public.accreditation_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
