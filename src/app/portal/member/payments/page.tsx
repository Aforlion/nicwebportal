import { getMemberPayments } from "@/actions/member/payments"
import MemberPaymentsClient from "./MemberPaymentsClient"

export const dynamic = 'force-dynamic'

export default async function MemberPaymentsPage() {
    const data = await getMemberPayments()

    if ('error' in data) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Payments</h2>
                <p>{data.error}</p>
            </div>
        )
    }

    return <MemberPaymentsClient data={data as any} />
}
