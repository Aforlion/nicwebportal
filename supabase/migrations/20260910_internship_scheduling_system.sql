-- 20260910_internship_scheduling_system.sql
-- NIC Clinical Internship Scheduling & Cohort System

-- 1. Locations Table
CREATE TABLE IF NOT EXISTS public.internship_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'coming_soon',
  default_fee_amount NUMERIC(10,2),
  facility_partner_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cohorts Table (3 Months, Max 20 Students, 30 Days Late Join)
CREATE TABLE IF NOT EXISTS public.internship_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.internship_locations(id) ON DELETE CASCADE,
  cohort_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  late_join_deadline DATE NOT NULL,
  max_capacity INT NOT NULL DEFAULT 20,
  current_enrolled INT NOT NULL DEFAULT 0,
  fee_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Enrollments Table
CREATE TABLE IF NOT EXISTS public.internship_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.internship_cohorts(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.internship_locations(id) ON DELETE CASCADE,
  fee_paid NUMERIC(10,2) NOT NULL,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  payment_reference TEXT,
  is_late_join BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'enrolled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, cohort_id)
);

-- Enable RLS
ALTER TABLE public.internship_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read internship locations" ON public.internship_locations;
CREATE POLICY "Public read internship locations" ON public.internship_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read internship cohorts" ON public.internship_cohorts;
CREATE POLICY "Public read internship cohorts" ON public.internship_cohorts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access to internship_locations" ON public.internship_locations;
CREATE POLICY "Full access to internship_locations" ON public.internship_locations FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

DROP POLICY IF EXISTS "Full access to internship_cohorts" ON public.internship_cohorts;
CREATE POLICY "Full access to internship_cohorts" ON public.internship_cohorts FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

DROP POLICY IF EXISTS "Full access to internship_enrollments" ON public.internship_enrollments;
CREATE POLICY "Full access to internship_enrollments" ON public.internship_enrollments FOR ALL USING (true);
