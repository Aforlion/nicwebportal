-- ============================================
-- DATABASE PERFORMANCE OPTIMIZATION (v1)
-- ============================================

-- 1. Profiles Optimization
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Pending Registrations Optimization
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);

-- 3. LMS / Enrollments Optimization
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- 4. Memberships Optimization
CREATE INDEX IF NOT EXISTS idx_memberships_member_id ON public.memberships(member_id);

-- 5. Payments/Invoices Optimization (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE INDEX IF NOT EXISTS idx_payments_transaction_reference ON public.payments(transaction_reference);
    END IF;
END $$;
