import { getMemberDocuments } from "@/actions/member/documents"
import MemberDocumentsClient from "./MemberDocumentsClient"

export const dynamic = 'force-dynamic'

export default async function MemberDocumentsPage() {
    const data = await getMemberDocuments()

    if ('error' in data) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Documents</h2>
                <p>{data.error}</p>
            </div>
        )
    }

    return <MemberDocumentsClient initialDocuments={data.documents || []} />
}
