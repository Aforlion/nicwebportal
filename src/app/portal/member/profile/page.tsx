import { getMemberProfile } from "@/actions/member/profile"
import MemberProfileClient from "./MemberProfileClient"

export const dynamic = 'force-dynamic'

export default async function MemberProfilePage() {
    const data = await getMemberProfile()

    if ('error' in data) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
                <p>{data.error}</p>
            </div>
        )
    }

    return <MemberProfileClient initialData={data.profile as any} />
}
