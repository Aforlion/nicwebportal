import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const initialArticles = [
  {
    slug: 'nic-overview-and-mission',
    category: 'getting-started',
    title: 'What is the National Institute of Caregivers Nigeria (NIC)?',
    short_answer: 'NIC is the professional institute focused on developing, standardising and professionalising caregiving education and practice in Nigeria.',
    content_markdown: `### National Institute of Caregivers Nigeria (NIC)

NIC is the premier professional institute dedicated to standardising caregiving education, professional practice, and certification pathways across Nigeria.

**Core Offerings:**
- Professional Caregiver Education & Certification
- Supervised Clinical Internship Placements
- Digital Credential Verification & Public Registry
- Continuing Professional Development (CPD)`,
    prohibited_claims_guard: ['NIC is approved by US government', 'Guaranteed overseas jobs']
  },
  {
    slug: 'nursing-assistant-pathway-overview',
    category: 'programmes',
    title: 'What is the Nursing Assistant Certification Pathway?',
    short_answer: 'The pathway combines Level 1 Fundamentals, Level 2 Specialisation, Supervised Clinical Internship, and NIC Nursing Assistant Certification.',
    content_markdown: `### Nursing Assistant Certification Pathway

The structured pathway is designed for learners aiming for comprehensive caregiver education and documented clinical experience.

**Pathway Sequence:**
1. **Level 1 – Fundamentals of Professional Caregiving** (120 learning hours, online self-paced)
2. **Level 2 – Specialisation** (e.g. Geriatrics & Gerontology - 54 hrs)
3. **Supervised Clinical Internship** (Hands-on hospital/care home practicals)
4. **Professional Assessment & Certification** as a Nursing Assistant
5. **Digital Credential Verification** on the official NIC public registry`,
    prohibited_claims_guard: ['Automatic US CNA equivalence', 'Automatic QQI Level 5 equivalence']
  },
  {
    slug: 'level-1-fundamentals',
    category: 'programmes',
    title: 'Level 1 – Fundamentals of Professional Caregiving',
    short_answer: '120-hour online self-paced foundational caregiver training. Fee is ₦200,000 with no hidden assessment charges.',
    content_markdown: `### Level 1 – Fundamentals of Professional Caregiving

- **Duration:** 120 learning hours
- **Format:** Online, self-paced
- **Fee:** ₦200,000
- **Practical Component:** Practical skills demonstrations and assessments are integrated online. No physical travel is required for academic training.
- **Additional Fees:** None. Practical training, assessments, examinations, and certificate issuance are included.`,
    prohibited_claims_guard: ['Purely theoretical training with no skills']
  },
  {
    slug: 'level-2-geriatrics-specialisation',
    category: 'programmes',
    title: 'Level 2 – Geriatrics & Gerontology Specialisation',
    short_answer: '54-hour specialised elderly care training. Fee is ₦150,000. Ideal for elderly care and international care pathways.',
    content_markdown: `### Level 2 – Geriatrics & Gerontology

- **Duration:** 54 learning hours
- **Fee:** ₦150,000
- **Focus:** Elderly care, gerontological principles, chronic condition management, and specialized support for older adults.
- **Relevance:** Essential for caregivers targeting aged care sectors in Nigeria or international destinations.`,
    prohibited_claims_guard: ['Guaranteed Australian aged care job']
  },
  {
    slug: 'clinical-internship-details',
    category: 'internship',
    title: 'How does the Clinical Internship work?',
    short_answer: 'Supervised hands-on clinical placement in accredited healthcare facilities. Cost is ₦150,000–₦200,000. Direct booking available in Abuja & Lagos network.',
    content_markdown: `### Clinical Internship Component

- **Cost:** ₦150,000–₦200,000 (depending on facility arrangement)
- **Placements:** 
  - **Abuja Candidates:** Can book placement directly through NIC in partner hospitals/care homes.
  - **Lagos & Other States:** Arranged through NIC accredited partner facilities or approved healthcare institutions.
- **Documentation Provided:** Official Internship Completion Letter stating facility name, verified dates, total practical hours, and supervisor signature/stamp.
- **Note on Hours:** Exact placement duration and practical hours are confirmed during placement booking.`,
    prohibited_claims_guard: ['Inventing fixed unconfirmed internship hours', 'Disclosing non-public facility names']
  },
  {
    slug: 'total-fee-breakdown',
    category: 'fees',
    title: 'What is the total cost for the full Nursing Assistant Pathway?',
    short_answer: 'Estimated total cost is ₦505,000 – ₦555,000, including Level 1, Level 2, Internship, and ₦5,000 NIC Membership.',
    content_markdown: `### Complete Pathway Fee Breakdown

| Component | Fee |
|---|---|
| Level 1 Fundamentals | ₦200,000 |
| Level 2 Specialisation (Geriatrics) | ₦150,000 |
| Clinical Internship | ₦150,000 – ₦200,000 |
| NIC Professional Membership | ₦5,000 |
| **Total Estimated Cost** | **₦505,000 – ₦555,000** |

**Transparency Guarantee:**
There are **no separate compulsory charges** for practical assessments, online examinations, certificate generation, or digital verification.`,
    prohibited_claims_guard: ['Hidden registration fees', 'Mandatory extra exam charges']
  },
  {
    slug: 'international-recognition-eb3-qqi',
    category: 'international',
    title: 'Is NIC certification recognised in the US, Ireland (QQI), or Australia?',
    short_answer: 'NIC credentials are verifiable globally on our public registry. However, foreign employers/regulators determine equivalency; NIC is not automatically equivalent to US CNA or QQI Level 5.',
    content_markdown: `### Credential Verification vs. International Recognition

- **Digital Verification:** Foreign employers, immigration agencies, and institutions can independently verify your certificate and transcript on NIC's public digital registry.
- **US EB-3 Visa / CNA:** NIC training builds a verifiable professional profile. However, NIC does **not** guarantee EB-3 visa sponsorship or state CNA licensing. Decisions are made by US employers and US immigration authorities.
- **Ireland QQI Level 5:** NIC qualifications should **not** be presented as automatically equivalent to QQI Level 5. Acceptance or credit evaluation depends on the specific Irish employer or evaluation authority.
- **Australia Aged Care:** Suitable for building verifiable elderly care skills, but subject to Australian immigration and employer requirements.`,
    prohibited_claims_guard: [
      'NIC is approved by the US government',
      'NIC guarantees an EB-3 visa',
      'NIC is automatically equivalent to QQI Level 5',
      'NIC guarantees overseas employment'
    ]
  },
  {
    slug: 'sample-certificates-and-transcripts-policy',
    category: 'certification',
    title: 'Can I get a sample/specimen certificate or transcript before enrolling?',
    short_answer: 'NIC does not issue specimen or sample copies of certificates/transcripts to prospective applicants to safeguard document security.',
    content_markdown: `### Sample Certificate & Transcript Policy

NIC **does not provide specimen or sample copies** of certificates, transcripts, or internship verification letters to prospective applicants.

**Security & Assurance:**
- Official documents and transcripts are generated automatically upon successful completion of training and internship requirements.
- All documents feature digital QR verification codes linked directly to the NIC official registry.`,
    prohibited_claims_guard: ['Providing fake or mock certificate templates']
  },
  {
    slug: 'international-students-and-study-format',
    category: 'getting-started',
    title: 'Can I study from outside Nigeria?',
    short_answer: 'Yes! Academic training and assessments are 100% online and self-paced. Internship can be scheduled in Nigeria when ready.',
    content_markdown: `### International & Remote Applicants

- **Online Academic Training:** Applicants residing outside Nigeria (e.g. Sierra Leone, Ghana, UK, UAE) can complete Level 1 and Level 2 online remotely.
- **Clinical Internship:** Candidates can travel to Nigeria to complete their clinical internship in Abuja or Lagos, or arrange an approved partner placement.
- **Entry Requirements:** Open to individuals with SSCE, ND, HND, BSc or career changers. Previous healthcare experience is not required for Level 1.`,
    prohibited_claims_guard: ['Online-only clinical internship without physical placement']
  }
];

async function seedKnowledgeBase() {
  console.log('Seeding NIC Single Source of Truth Knowledge Base...');

  for (const article of initialArticles) {
    // Check if article exists
    const { data: existing } = await supabase
      .from('kb_articles')
      .select('id')
      .eq('slug', article.slug)
      .single();

    let articleId = existing?.id;

    if (articleId) {
      // Update article
      await supabase
        .from('kb_articles')
        .update({
          category: article.category,
          title: article.title,
          content_markdown: article.content_markdown,
          short_answer: article.short_answer,
          prohibited_claims_guard: article.prohibited_claims_guard,
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId);

      console.log(`Updated article: ${article.title}`);
    } else {
      // Insert article
      const { data: inserted, error } = await supabase
        .from('kb_articles')
        .insert({
          slug: article.slug,
          category: article.category,
          title: article.title,
          content_markdown: article.content_markdown,
          short_answer: article.short_answer,
          prohibited_claims_guard: article.prohibited_claims_guard,
          is_published: true,
          published_version_number: 1
        })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting ${article.slug}:`, error.message);
        continue;
      }
      articleId = inserted.id;
      console.log(`Inserted article: ${article.title}`);
    }

    // Insert version 1 snapshot
    await supabase.from('kb_versions').upsert(
      {
        article_id: articleId,
        version_number: 1,
        title: article.title,
        content_markdown: article.content_markdown,
        short_answer: article.short_answer,
        change_summary: 'Initial import from NIC Knowledge Base v1.0 & Prospect Enquiries'
      },
      { onConflict: 'article_id,version_number' }
    );
  }

  console.log('Knowledge Base seeding complete!');
}

seedKnowledgeBase().catch(console.error);
