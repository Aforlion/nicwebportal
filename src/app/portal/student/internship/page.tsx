import { getStudentInternships } from "@/actions/member/internships"
import InternshipClient from "./InternshipClient"

export const dynamic = 'force-dynamic'

export default async function InternshipPage() {
    const data = await getStudentInternships()

    if ('error' in data) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Internships</h2>
                <p>{data.error}</p>
            </div>
        )
    }

    return <InternshipClient initialInternships={data.internships || []} />
}

