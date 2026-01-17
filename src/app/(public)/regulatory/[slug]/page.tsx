import { POLICIES } from "@/lib/policies"
import { PolicyViewer } from "@/components/policy-viewer"
import { notFound } from "next/navigation"
import fs from "fs"
import path from "path"

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function PolicyPage({ params }: PageProps) {
    const { slug } = await params
    const policy = POLICIES.find(p => p.slug === slug)

    if (!policy) {
        notFound()
    }

    // Mapping slugs to actual filenames
    const fileMap: Record<string, string> = {
        'regulatory-framework': 'NIC Regulatory Framework.txt',
        'facility-accreditation-framework': 'NIC Facility Accreditation Framework.txt',
        'code-of-ethics-facility': 'NIC Code of Ethics - Facility.txt',
        'inspection-compliance-sanctions': 'NIC INSPECTION, COMPLIANCE & SANCTIONS POLICY.txt',
        'inspection-scoring-matrix': 'NIC Inspection Scoring Matrix & Compliance Framework.txt',
        'accreditation-terms': 'NIC ACCREDITATION TERMS & CONDITIONS.txt',
        'student-training-agreement': 'NIC STUDENT & TRAINING AGREEME.txt',
        'terms-and-privacy': 'NIC Terms and Privacy.txt'
    }

    const filename = fileMap[slug]
    let content = "Document content loading..."

    try {
        const filePath = path.join(process.cwd(), 'NIC policies', filename)
        content = fs.readFileSync(filePath, 'utf8')
    } catch (err) {
        console.error(`Error reading policy file: ${filename}`, err)
        content = "Error: Could not load the document content. Please contact the administrator."
    }

    return (
        <div className="bg-white min-h-screen">
            <PolicyViewer
                title={policy.title}
                content={content}
                category={policy.category}
            />
        </div>
    )
}

// Generate static params for performance
export async function generateStaticParams() {
    return POLICIES.map((policy) => ({
        slug: policy.slug,
    }))
}
