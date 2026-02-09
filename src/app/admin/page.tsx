import { getDashboardStats } from "@/actions/admin/get-dashboard-stats"
import { AdminDashboardClient } from "./AdminDashboardClient"

export default async function AdminDashboardPage() {
    const data = await getDashboardStats()
    return <AdminDashboardClient initialData={data} />
}
