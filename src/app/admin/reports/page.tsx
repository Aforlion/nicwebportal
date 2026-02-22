import { getAnalyticsData } from "@/actions/admin/analytics"
import ReportsClient from "./ReportsClient"

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
    const { stats, breakdown, chartData, error } = await getAnalyticsData()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Analytics</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <ReportsClient
            data={{
                stats: stats!,
                breakdown: breakdown!,
                chartData: chartData!
            }}
        />
    )
}
