import { getMemberCPDData } from "@/actions/member/cpd"
import MemberCPDClient from "./MemberCPDClient"

export const dynamic = 'force-dynamic'

export default async function MemberCPDPage() {
    const data = await getMemberCPDData()

    if ('error' in data && data.error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading CPD Records</h2>
                <p>{data.error}</p>
            </div>
        )
    }

    return (
        <MemberCPDClient
            activities={(data as any).activities || []}
            totalPoints={(data as any).totalPoints || 0}
            approvedCount={(data as any).approvedCount || 0}
            certificateCount={(data as any).certificateCount || 0}
            membershipId={(data as any).membershipId || ''}
        />
    )
}
