import fetch from "node-fetch";

const token = process.env.SUPABASE_ACCESS_TOKEN || "";
const projectRef = "fyaeabdaxqrdosdksqwx";

const sqlQuery = `
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
  '### National Institute of Caregivers Nigeria (NIC)\n\nNIC is the premier professional institute dedicated to standardising caregiving education, professional practice, and certification pathways across Nigeria.\n\n**Core Offerings:**\n- Professional Caregiver Education & Certification\n- Supervised Clinical Internship Placements\n- Digital Credential Verification & Public Registry\n- Continuing Professional Development (CPD)',
  ARRAY['NIC is approved by US government', 'Guaranteed overseas jobs'],
  true,
  1
),
(
  'nursing-assistant-pathway-overview',
  'programmes',
  'What is the Nursing Assistant Certification Pathway?',
  'The pathway combines Level 1 Fundamentals, Level 2 Specialisation, Supervised Clinical Internship, and NIC Nursing Assistant Certification.',
  '### Nursing Assistant Certification Pathway\n\nThe structured pathway is designed for learners aiming for comprehensive caregiver education and documented clinical experience.\n\n**Pathway Sequence:**\n1. **Level 1 – Fundamentals of Professional Caregiving** (120 learning hours, online self-paced)\n2. **Level 2 – Specialisation** (e.g. Geriatrics & Gerontology - 54 hrs)\n3. **Supervised Clinical Internship** (Hands-on hospital/care home practicals)\n4. **Professional Assessment & Certification** as a Nursing Assistant\n5. **Digital Credential Verification** on the official NIC public registry',
  ARRAY['Automatic US CNA equivalence', 'Automatic QQI Level 5 equivalence'],
  true,
  1
),
(
  'level-1-fundamentals',
  'programmes',
  'Level 1 – Fundamentals of Professional Caregiving',
  '120-hour online self-paced foundational caregiver training. Fee is ₦200,000 with no hidden assessment charges.',
  '### Level 1 – Fundamentals of Professional Caregiving\n\n- **Duration:** 120 learning hours\n- **Format:** Online, self-paced\n- **Fee:** ₦200,000\n- **Practical Component:** Practical skills demonstrations and assessments are integrated online. No physical travel is required for academic training.\n- **Additional Fees:** None. Practical training, assessments, examinations, and certificate issuance are included.',
  ARRAY['Purely theoretical training with no skills'],
  true,
  1
),
(
  'level-2-geriatrics-specialisation',
  'programmes',
  'Level 2 – Geriatrics & Gerontology Specialisation',
  '54-hour specialised elderly care training. Fee is ₦150,000. Ideal for elderly care and international care pathways.',
  '### Level 2 – Geriatrics & Gerontology\n\n- **Duration:** 54 learning hours\n- **Fee:** ₦150,000\n- **Focus:** Elderly care, gerontological principles, chronic condition management, and specialized support for older adults.\n- **Relevance:** Essential for caregivers targeting aged care sectors in Nigeria or international destinations.',
  ARRAY['Guaranteed Australian aged care job'],
  true,
  1
),
(
  'clinical-internship-details',
  'internship',
  'How does the Clinical Internship work?',
  'Supervised 3-month clinical placement in accredited healthcare facilities (capped at 20 students per cohort). Location fees: Abuja (₦200,000), Lagos (₦150,000), Uyo (₦200,000), with Osun, Enugu, & Kaduna pricing TBD. Late enrollment is allowed up to 1 month after start date if capacity permits.',
  '### Clinical Internship Component & Scheduling\n\n- **Duration:** Exactly 3 Months per cohort.\n- **Cohort Capacity:** Maximum 20 students per cohort.\n- **Location Pricing:** Abuja (₦200,000 Active), Lagos (₦150,000), Uyo (₦200,000), Osun/Enugu/Kaduna TBD.\n- **Late-Join Window:** Students may join up to 30 days after start if space permits.\n- **Documentation:** Official Internship Completion Letter stating facility name, dates, total hours, and supervisor signature.',
  ARRAY['Inventing fixed unconfirmed internship hours', 'Disclosing non-public facility names'],
  true,
  1
),
(
  'total-fee-breakdown',
  'fees',
  'What is the total cost for the full Nursing Assistant Pathway?',
  'Estimated total cost is ₦505,000 – ₦555,000, including Level 1, Level 2, Internship, and ₦5,000 NIC Membership.',
  '### Complete Pathway Fee Breakdown\n\n| Component | Fee |\n|---|---|\n| Level 1 Fundamentals | ₦200,000 |\n| Level 2 Specialisation (Geriatrics) | ₦150,000 |\n| Clinical Internship | ₦150,000 – ₦200,000 |\n| NIC Professional Membership | ₦5,000 |\n| **Total Estimated Cost** | **₦505,000 – ₦555,000** |\n\n**Transparency Guarantee:**\nThere are **no separate compulsory charges** for practical assessments, online examinations, certificate generation, or digital verification.',
  ARRAY['Hidden registration fees', 'Mandatory extra exam charges'],
  true,
  1
),
(
  'international-recognition-eb3-qqi',
  'international',
  'Is NIC certification recognised in the US, Ireland (QQI), or Australia?',
  'NIC credentials are verifiable globally on our public registry. However, foreign employers/regulators determine equivalency; NIC is not automatically equivalent to US CNA or QQI Level 5.',
  '### Credential Verification vs. International Recognition\n\n- **Digital Verification:** Foreign employers, immigration agencies, and institutions can independently verify your certificate and transcript on NIC''s public digital registry.\n- **US EB-3 Visa / CNA:** NIC training builds a verifiable professional profile. However, NIC does **not** guarantee EB-3 visa sponsorship or state CNA licensing. Decisions are made by US employers and US immigration authorities.\n- **Ireland QQI Level 5:** NIC qualifications should **not** be presented as automatically equivalent to QQI Level 5. Acceptance or credit evaluation depends on the specific Irish employer or evaluation authority.\n- **Australia Aged Care:** Suitable for building verifiable elderly care skills, but subject to Australian immigration and employer requirements.',
  ARRAY['NIC is approved by the US government', 'NIC guarantees an EB-3 visa', 'NIC is automatically equivalent to QQI Level 5', 'NIC guarantees overseas employment'],
  true,
  1
),
(
  'sample-certificates-and-transcripts-policy',
  'certification',
  'Can I get a sample/specimen certificate or transcript before enrolling?',
  'NIC does not issue specimen or sample copies of certificates/transcripts to prospective applicants to safeguard document security.',
  '### Sample Certificate & Transcript Policy\n\nNIC **does not provide specimen or sample copies** of certificates, transcripts, or internship verification letters to prospective applicants.\n\n**Security & Assurance:**\n- Official documents and transcripts are generated automatically upon successful completion of training and internship requirements.\n- All documents feature digital QR verification codes linked directly to the NIC official registry.',
  ARRAY['Providing fake or mock certificate templates'],
  true,
  1
),
(
  'international-students-and-study-format',
  'getting-started',
  'Can I study from outside Nigeria?',
  'Yes! Academic training and assessments are 100% online and self-paced. Internship can be scheduled in Nigeria when ready.',
  '### International & Remote Applicants\n\n- **Online Academic Training:** Applicants residing outside Nigeria (e.g. Sierra Leone, Ghana, UK, UAE) can complete Level 1 and Level 2 online remotely.\n- **Clinical Internship:** Candidates can travel to Nigeria to complete their clinical internship in Abuja or Lagos, or arrange an approved partner placement.\n- **Entry Requirements:** Open to individuals with SSCE, ND, HND, BSc or career changers. Previous healthcare experience is not required for Level 1.',
  ARRAY['Online-only clinical internship without physical placement'],
  true,
  1
),
(
  'how-to-enrol-and-register',
  'getting-started',
  'How do I enrol or register for an NIC programme?',
  'You can enrol directly online on our Programs page by selecting your desired course, creating an account, and completing payment via Paystack.',
  '### How to Enrol in an NIC Programme\n\n1. **Browse Programmes:** Visit https://www.nicnigeria.org/programs to view available courses.\n2. **Select Your Pathway:** Choose Level 1 Fundamentals or a Level 2 Specialisation (e.g. Geriatrics & Gerontology).\n3. **Create Account:** Click "Enroll Now" and create your student portal profile.\n4. **Complete Payment:** Pay securely online via debit card, USSD, or bank transfer using Paystack.\n5. **Instant Access:** Start your self-paced online modules immediately after payment confirmation.',
  ARRAY['In-person cash payment requirement'],
  true,
  1
),
(
  'admission-entry-requirements',
  'getting-started',
  'What are the entry and admission requirements?',
  'No prior healthcare experience is required for Level 1. Open to O-Level (SSCE), ND, HND, BSc holders, and career changers.',
  '### Admission Requirements\n\n- **Foundational Caregiver (Level 1):** Open to all interested applicants. No prior medical or caregiving experience is required.\n- **Educational Background:** Minimum SSCE / O-Level, ND, HND, or Degree holders are welcome.\n- **Technical Requirements:** A smartphone, tablet, or laptop with internet access for self-paced online modules.\n- **International Applicants:** Eligible to study remotely from any country.',
  ARRAY['Guaranteed university degree equivalency'],
  true,
  1
),
(
  'payment-methods-and-installment',
  'fees',
  'What payment methods are accepted?',
  'We accept debit cards, bank transfers, and USSD securely via Paystack on our portal.',
  '### Approved Payment Methods\n\nAll payments are processed securely through Paystack on the official NIC Portal:\n- **Debit Cards:** Visa, Mastercard, Verve\n- **Bank Transfer & USSD:** Instant bank account transfers\n- **Receipts:** Digital payment receipts are generated automatically upon successful transaction.\n- **Fee Policy:** Tuition includes all online course materials and assessments. Zero hidden charges.',
  ARRAY['Manual cash handovers'],
  true,
  1
),
(
  'certificates-and-transcripts-awarded',
  'certification',
  'What certificate and transcript will I receive upon completion?',
  'You receive an official NIC Certificate and Academic Transcript featuring a digital QR code for instant global verification.',
  '### Official Credentials Issued\n\nUpon successful completion of training and clinical internship:\n1. **NIC Certificate:** Official Nursing Assistant / Caregiver Certificate issued by National Institute of Caregivers Nigeria.\n2. **Academic Transcript:** Documenting completed modules, learning hours, and practical competencies.\n3. **Digital Verification QR Code:** Embedded on every certificate, allowing third-party employers globally to verify your credential on our public registry at https://www.nicnigeria.org/verify.',
  ARRAY['Blank sample certificate requests'],
  true,
  1
),
(
  'programme-duration-and-flexibility',
  'programmes',
  'How long does each programme take and can I study while working?',
  'Level 1 takes 120 self-paced hours. Level 2 takes 40-54 hours. Clinical internship is 3 months. Modules are 100% flexible for working students.',
  '### Programme Durations & Flexibility\n\n- **Level 1 Fundamentals:** 120 learning hours (100% online, self-paced, study anytime around your schedule).\n- **Level 2 Specialisation:** 40 to 54 hours (online, self-paced).\n- **Clinical Internship:** 3 Months (quarterly cohorts in Abuja, Lagos, Uyo, etc.).\n- **Flexibility:** Designed specifically to accommodate working adults and international students.',
  ARRAY['Instant 1-day certificate promises'],
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

async function runProdDDL() {
  console.log(`Sending DDL migration to Supabase project ${projectRef}...`);
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: sqlQuery })
  });

  const resText = await response.text();
  console.log(`Status: ${response.status} ${response.statusText}`);
  console.log(`Response:`, resText);
}

runProdDDL();
