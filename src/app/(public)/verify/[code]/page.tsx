import { redirect } from "next/navigation"

export default async function VerifyCodeRedirectPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params
    redirect(`/certificates/${code}`)
}
