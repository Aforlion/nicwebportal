export interface Policy {
    slug: string;
    title: string;
    description: string;
    category: 'Accreditation' | 'Regulatory' | 'Ethics' | 'Legal';
    icon?: string;
}

export const POLICIES: Policy[] = [
    {
        slug: 'regulatory-framework',
        title: 'NIC Regulatory Framework',
        description: 'The overarching framework governing caregiving standards and professional practice in Nigeria.',
        category: 'Regulatory'
    },
    {
        slug: 'facility-accreditation-framework',
        title: 'Facility Accreditation Framework',
        description: 'Comprehensive requirements for institutional accreditation and national registry listing.',
        category: 'Accreditation'
    },
    {
        slug: 'code-of-ethics-facility',
        title: 'Code of Ethics (Facility)',
        description: 'Professional conduct and ethical standards for care institutions and their management.',
        category: 'Ethics'
    },
    {
        slug: 'inspection-compliance-sanctions',
        title: 'Inspection & Sanctions Policy',
        description: 'Guidelines for regulatory monitoring, compliance scoring, and administrative enforcement.',
        category: 'Regulatory'
    },
    {
        slug: 'inspection-scoring-matrix',
        title: 'Inspection Scoring Matrix',
        description: 'Technical framework used to evaluate facility quality and compliance during site visits.',
        category: 'Accreditation'
    },
    {
        slug: 'accreditation-terms',
        title: 'Accreditation Terms & Conditions',
        description: 'Legal agreement and conditionalities for care facilities seeking NIC accreditation.',
        category: 'Accreditation'
    },
    {
        slug: 'student-training-agreement',
        title: 'Student & Training Agreement',
        description: 'Terms of engagement for individuals enrolled in NIC certified training programs.',
        category: 'Legal'
    },
    {
        slug: 'terms-and-privacy',
        title: 'Terms of Use & Privacy Policy',
        description: 'Universal legal terms governing the use of NIC digital platforms and data protection.',
        category: 'Legal'
    },
    {
        slug: 'accreditation-framework',
        title: 'Accreditation Framework',
        description: 'Framework for institutional training and accreditation of caregiver partners.',
        category: 'Accreditation'
    },
    {
        slug: 'code-of-ethics-professional',
        title: 'Code of Ethics & Professional Conduct',
        description: 'Core values, ethical responsibilities and professional conduct standards for caregivers.',
        category: 'Ethics'
    },
    {
        slug: 'cpd-framework',
        title: 'Continuing Professional Development (CPD) Framework',
        description: 'Continuing education requirement pathways and credit systems for licensed caregivers.',
        category: 'Regulatory'
    },
    {
        slug: 'curriculum-approval-framework',
        title: 'Curriculum Approval Framework',
        description: 'Review and accreditation criteria for caregiver training partner curricula.',
        category: 'Accreditation'
    },
    {
        slug: 'digital-credentials-verification',
        title: 'Digital Credentials & Verification Framework',
        description: 'Systems architecture and security standards for digital badge and certificate verification.',
        category: 'Regulatory'
    },
    {
        slug: 'inspection-compliance-framework',
        title: 'Inspection & Compliance Framework',
        description: 'Standardized operational procedures for facility monitoring and compliance audits.',
        category: 'Regulatory'
    },
    {
        slug: 'instructor-approval-framework',
        title: 'Instructor Approval Framework',
        description: 'Licensing and verification requirements for caregiver training instructors.',
        category: 'Accreditation'
    },
    {
        slug: 'internship-framework',
        title: 'Internship Framework',
        description: 'Clinical placement guidelines, supervision structures, and completion standards.',
        category: 'Regulatory'
    },
    {
        slug: 'professional-certification-framework',
        title: 'Professional Certification Framework',
        description: 'Requirements and pathways for the National Certified Nursing Assistant (NCNA) credential.',
        category: 'Accreditation'
    },
    {
        slug: 'research-innovation-framework',
        title: 'Research, Innovation & Publications Framework',
        description: 'Guidelines for academic research, product evaluation and publications in caregiving.',
        category: 'Regulatory'
    },
    {
        slug: 'training-education-framework',
        title: 'Training & Education Framework',
        description: 'Standardized educational structures and competencies for nursing assistants.',
        category: 'Accreditation'
    },
    {
        slug: 'constitution-governance',
        title: 'Constitution and Governance Chart',
        description: 'Organisational charter, governing structures, and constitutional frameworks of NIC Nigeria.',
        category: 'Legal'
    }
];
