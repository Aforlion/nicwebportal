import { Client } from 'pg'

async function deployProdSchema() {
  const connectionString = 'postgresql://postgres:bMiVaaFOpLeRhXulAKYTASjXVWNjUAlV@db.fyaeabdaxqrdosdksqwx.supabase.co:6543/postgres'
  
  console.log('Connecting to target Supabase database fyaeabdaxqrdosdksqwx...')
  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('🎉 SUCCESSFULLY CONNECTED TO PRODUCTION DATABASE!')

    const sql = `
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. KB Articles Table
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  prohibited_claims_guard TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  published_version_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KB Versions Table
CREATE TABLE IF NOT EXISTS public.kb_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  change_summary TEXT DEFAULT 'Initial version',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, version_number)
);

-- 3. KB Embeddings Table
CREATE TABLE IF NOT EXISTS public.kb_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  chunk_content TEXT NOT NULL,
  embedding vector(1536),
  version_number INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. KB Escalations
CREATE TABLE IF NOT EXISTS public.kb_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'website',
  user_identifier TEXT,
  user_name TEXT,
  query_text TEXT NOT NULL,
  bot_response TEXT,
  reason TEXT NOT NULL DEFAULT 'human_requested',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. KB Feedback
CREATE TABLE IF NOT EXISTS public.kb_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Internship Locations Table
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

-- 7. Internship Cohorts Table
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

-- 8. Internship Enrollments Table
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

-- RLS & Grants
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_enrollments ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.kb_articles TO anon, authenticated;
GRANT SELECT ON public.kb_versions TO anon, authenticated;
GRANT SELECT ON public.kb_embeddings TO anon, authenticated;
GRANT SELECT, INSERT ON public.kb_feedback TO anon, authenticated;
GRANT INSERT ON public.kb_escalations TO anon, authenticated;
GRANT SELECT ON public.internship_locations TO anon, authenticated;
GRANT SELECT ON public.internship_cohorts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.internship_enrollments TO anon, authenticated;

DROP POLICY IF EXISTS "Public read kb_articles" ON public.kb_articles;
CREATE POLICY "Public read kb_articles" ON public.kb_articles FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Full access kb_articles" ON public.kb_articles;
CREATE POLICY "Full access kb_articles" ON public.kb_articles FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access kb_versions" ON public.kb_versions;
CREATE POLICY "Full access kb_versions" ON public.kb_versions FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access kb_embeddings" ON public.kb_embeddings;
CREATE POLICY "Full access kb_embeddings" ON public.kb_embeddings FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access kb_escalations" ON public.kb_escalations;
CREATE POLICY "Full access kb_escalations" ON public.kb_escalations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public insert kb_feedback" ON public.kb_feedback;
CREATE POLICY "Public insert kb_feedback" ON public.kb_feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read internship locations" ON public.internship_locations;
CREATE POLICY "Public read internship locations" ON public.internship_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read internship cohorts" ON public.internship_cohorts;
CREATE POLICY "Public read internship cohorts" ON public.internship_cohorts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access internship_locations" ON public.internship_locations;
CREATE POLICY "Full access internship_locations" ON public.internship_locations FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access internship_cohorts" ON public.internship_cohorts;
CREATE POLICY "Full access internship_cohorts" ON public.internship_cohorts FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access internship_enrollments" ON public.internship_enrollments;
CREATE POLICY "Full access internship_enrollments" ON public.internship_enrollments FOR ALL USING (true);

-- Seed Initial Internship Locations
INSERT INTO public.internship_locations (city_name, state, status, default_fee_amount, address)
VALUES
('Abuja', 'FCT', 'active', 200000.00, 'NIC Clinical Skills Centre, Central Business District, Abuja'),
('Lagos', 'Lagos State', 'coming_soon', 150000.00, 'NIC Affiliated Hospital Partner, Ikeja, Lagos'),
('Uyo', 'Akwa Ibom State', 'coming_soon', 200000.00, 'NIC Training Facility Network, Uyo'),
('Osun', 'Osun State', 'coming_soon', NULL, 'NIC Partner Network, Osogbo'),
('Enugu', 'Enugu State', 'coming_soon', NULL, 'NIC Partner Network, Enugu'),
('Kaduna', 'Kaduna State', 'coming_soon', NULL, 'NIC Partner Network, Kaduna')
ON CONFLICT (city_name) DO UPDATE
SET default_fee_amount = EXCLUDED.default_fee_amount,
    status = EXCLUDED.status,
    address = EXCLUDED.address;

-- Seed Initial Abuja 3-Month Cohort (Q4 2026)
INSERT INTO public.internship_cohorts (location_id, cohort_name, start_date, end_date, late_join_deadline, max_capacity, current_enrolled, fee_amount, status)
SELECT id, 'Abuja Oct-Dec 2026 Cohort', '2026-10-01', '2026-12-31', '2026-10-31', 20, 6, 200000.00, 'open'
FROM public.internship_locations WHERE city_name = 'Abuja'
ON CONFLICT DO NOTHING;

-- Seed Initial KB Articles
INSERT INTO public.kb_articles (slug, category, title, short_answer, content_markdown, prohibited_claims_guard, is_published, published_version_number)
VALUES
(
  'nic-overview-and-mission',
  'getting-started',
  'What is the National Institute of Caregivers Nigeria (NIC)?',
  'NIC is the professional institute focused on developing, standardising and professionalising caregiving education and practice in Nigeria.',
  'NIC is the premier professional institute dedicated to standardising caregiving education, professional practice, and certification pathways across Nigeria.',
  ARRAY['NIC is approved by US government', 'Guaranteed overseas jobs'],
  true,
  1
),
(
  'nursing-assistant-pathway-overview',
  'programmes',
  'What is the Nursing Assistant Certification Pathway?',
  'The pathway combines Level 1 Fundamentals, Level 2 Specialisation, Supervised Clinical Internship, and NIC Nursing Assistant Certification.',
  'The structured pathway combines Level 1 Fundamentals (120 hrs), Level 2 Specialisation, Supervised Clinical Internship, and NIC Nursing Assistant Certification.',
  ARRAY['Automatic US CNA equivalence', 'Automatic QQI Level 5 equivalence'],
  true,
  1
),
(
  'clinical-internship-details',
  'internship',
  'How does the Clinical Internship work?',
  'Supervised 3-month clinical placement in accredited healthcare facilities (capped at 20 students per cohort). Location fees: Abuja (₦200,000), Lagos (₦150,000), Uyo (₦200,000), with Osun, Enugu, & Kaduna pricing TBD.',
  'Supervised 3-month clinical placement in accredited healthcare facilities (capped at 20 students per cohort). Location fees: Abuja (₦200,000), Lagos (₦150,000), Uyo (₦200,000).',
  ARRAY['Inventing fixed unconfirmed internship hours'],
  true,
  1
),
(
  'total-fee-breakdown',
  'fees',
  'What is the total cost for the full Nursing Assistant Pathway?',
  'Estimated total cost is ₦505,000 – ₦555,000, including Level 1, Level 2, Internship, and ₦5,000 NIC Membership.',
  'Estimated total cost is ₦505,000 – ₦555,000, including Level 1 (₦200k), Level 2 (₦150k), Internship (₦150k-₦200k), and ₦5,000 Membership.',
  ARRAY['Hidden registration fees'],
  true,
  1
),
(
  'international-recognition-eb3-qqi',
  'international',
  'Is NIC certification recognised in the US, Ireland (QQI), or Australia?',
  'NIC credentials are verifiable globally on our public registry. Foreign employers/regulators determine equivalency.',
  'NIC credentials are verifiable globally on our public registry at https://www.nicnigeria.org/verify. Foreign employers/regulators determine individual equivalency.',
  ARRAY['NIC is approved by the US government', 'NIC guarantees an EB-3 visa'],
  true,
  1
),
(
  'how-to-enrol-and-register',
  'getting-started',
  'How do I enrol or register for an NIC programme?',
  'You can enrol directly online on our Programs page by selecting your desired course, creating an account, and completing payment via Paystack.',
  'Visit https://www.nicnigeria.org/programs to view courses, create an account, and pay via Paystack.',
  ARRAY['In-person cash payment requirement'],
  true,
  1
),
(
  'admission-entry-requirements',
  'getting-started',
  'What are the entry and admission requirements?',
  'No prior healthcare experience is required for Level 1. Open to O-Level (SSCE), ND, HND, BSc holders, and career changers.',
  'No prior healthcare experience is required for Level 1. Open to O-Level (SSCE), ND, HND, BSc holders.',
  ARRAY['Guaranteed university degree equivalency'],
  true,
  1
),
(
  'certificates-and-transcripts-awarded',
  'certification',
  'What certificate and transcript will I receive upon completion?',
  'You receive an official NIC Certificate and Academic Transcript featuring a digital QR code for instant global verification.',
  'Official NIC Nursing Assistant Certificate and Academic Transcript featuring digital QR verification code.',
  ARRAY['Blank sample certificate requests'],
  true,
  1
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    category = EXCLUDED.category,
    short_answer = EXCLUDED.short_answer,
    content_markdown = EXCLUDED.content_markdown,
    is_published = true;

-- Seed Versions
INSERT INTO public.kb_versions (article_id, version_number, title, short_answer, content_markdown, change_summary)
SELECT id, 1, title, short_answer, content_markdown, 'Initial import into production database'
FROM public.kb_articles
ON CONFLICT (article_id, version_number) DO NOTHING;
`;

    await client.query(sql)
    console.log('🎉 SUCCESSFULLY DEPLOYED ALL TABLES AND SEED DATA TO PRODUCTION DATABASE (fyaeabdaxqrdosdksqwx)!')
  } catch (err: any) {
    console.error('Database connection or migration failed:', err.message)
  } finally {
    await client.end()
  }
}

deployProdSchema()
