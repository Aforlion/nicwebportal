import { getSubmissions } from "@/actions/admin/manage-assessments"
import AssessmentsClient from "./AssessmentsClient"

export default async function AssessmentsPage() {
    const { submissions, error } = await getSubmissions()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Assessments</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <AssessmentsClient initialSubmissions={submissions || []} />
        </div>
    )
}
