import { getMemberDashboardData } from "@/actions/member/get-dashboard"
import MemberDashboardClient from "./MemberDashboardClient"
import { redirect } from "next/navigation"

import { ErrorBoundary } from "@/components/error-boundary"

export const dynamic = 'force-dynamic'

export default async function MemberDashboard() {
    const data = await getMemberDashboardData()

    if ('redirect' in data && data.redirect) {
        redirect(data.redirect)
    }

    if ('error' in data) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
                <p>{data.error}</p>
                <div className="mt-4">
                    <a href="/login" className="text-sm underline">Try logging in again</a>
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <MemberDashboardClient data={data as any} />
        </ErrorBoundary>
    )
}
