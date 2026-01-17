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
    }
];
