import { getActionCenterItems } from "@/actions/admin/get-action-center-items"
import ActionCenterClient from "./ActionCenterClient"

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export default async function ActionCenterPage() {
    const { data, error } = await getActionCenterItems()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Action Center</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <ActionCenterClient initialData={data!} />
    )
}
