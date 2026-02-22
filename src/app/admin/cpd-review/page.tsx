import { getCPDSubmissions } from "@/actions/admin/cpd-management"
import CPDReviewClient from "./CPDReviewClient"

export const dynamic = 'force-dynamic'

export default async function AdminCPDReviewPage() {
    const { submissions, stats, error } = await getCPDSubmissions()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading CPD Review</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <CPDReviewClient
            initialSubmissions={submissions || []}
            initialStats={stats || { pending: 0, approvedThisMonth: 0, rejected: 0 }}
        />
    )
}
