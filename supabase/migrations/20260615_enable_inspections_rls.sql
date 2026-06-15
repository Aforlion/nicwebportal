-- ============================================
-- SQL Migration: Enable RLS on Inspections
-- ============================================

-- Enable Row-Level Security
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- 1. Admins/Inspectors can manage inspections
DROP POLICY IF EXISTS "Admins and Inspectors can manage inspections" ON public.inspections;
CREATE POLICY "Admins and Inspectors can manage inspections"
ON public.inspections FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'inspector')
    )
);

-- 2. Facility owners can view their own inspections
DROP POLICY IF EXISTS "Facility owners can view their own inspections" ON public.inspections;
CREATE POLICY "Facility owners can view their own inspections"
ON public.inspections FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.facilities
        WHERE facilities.id = inspections.facility_id
        AND facilities.owner_id = auth.uid()
    )
);
