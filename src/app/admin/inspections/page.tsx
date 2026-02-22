import { getFacilitiesData } from "@/actions/admin/inspection-management"
import InspectionsClient from "./InspectionsClient"

export const dynamic = 'force-dynamic'

export default async function AdminInspectionsPage() {
    const { facilities, stats, error } = await getFacilitiesData()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Facility Registry</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <InspectionsClient
            initialFacilities={facilities || []}
            stats={stats || { total: 0, compliant: 0, pending: 0, critical: 0 }}
        />
    )
}
