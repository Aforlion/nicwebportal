import { getCertificateByCode } from "@/actions/student/certificate"
import { notFound } from "next/navigation"
import { headers as getHeaders } from "next/headers"
import CertificateActions from "@/components/certificate/certificate-actions"
import PremiumCertificateView from "@/components/certificate/premium-certificate-view"
import Link from "next/link"
import { PremiumCertificateData, FacilityTypeKey } from "@/types/certificate"

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params
    const cert = await getCertificateByCode(code)

    if (!cert) {
        notFound()
    }

    const isNCNA = cert.type === 'ncna' || (cert.certificate_number && cert.certificate_number.startsWith('NCNA'))
    const isFacility = cert.type === 'facility_membership' || cert.facility_id

    const recipientName = (cert.profiles as any)?.full_name?.trim() || (cert.profiles as any)?.email || (cert.facilities as any)?.name || "Recipient"
    const courseTitle = (cert.programs as any)?.title || (cert.courses as any)?.title || (isNCNA ? "National Certified Nursing Assistant (NCNA)" : cert.course_level || "NIC Certification Program")

    // Absolute URL for QR code (prioritize env vars, fallback to dynamic request URL)
    const headersList = await getHeaders()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const dynamicAppUrl = `${protocol}://${host}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || dynamicAppUrl
    const verificationUrl = `${appUrl}/certificates/${code}`

    // Construct PremiumCertificateData structure for the view component
    let typeKey: FacilityTypeKey = 'general'
    if (cert.facility_type) {
        const ft = cert.facility_type.toLowerCase()
        if (ft === 'agency' || ft.includes('care_agency')) typeKey = 'agency'
        else if (ft === 'care_home' || ft.includes('assisted_living')) typeKey = 'care_home'
        else if (ft.includes('training')) typeKey = 'training_agency'
        else if (ft.includes('hospital') || ft.includes('clinical')) typeKey = 'hospital'
    }

    const issueDateStr = cert.issue_date || cert.created_at || new Date().toISOString()
    const issueYear = new Date(issueDateStr).getFullYear()

    const certData: PremiumCertificateData = {
        certificateNumber: cert.certificate_number,
        recipientName: isFacility ? (cert.facilities?.name || recipientName) : recipientName,
        facilityTypeKey: typeKey,
        facilityType: cert.facility_type ? cert.facility_type.replace('_', ' ').toUpperCase() : undefined,
        category: isFacility ? 'facility_membership' : isNCNA ? 'ncna_license' : 'course_completion',
        courseOrProgramName: courseTitle,
        issueDate: issueDateStr,
        duration: isFacility ? `12 Months (${issueYear} - ${issueYear + 1})` : `Lifetime Credential (Issued ${issueYear})`,
        verificationUrl,
        studentIdOrRegNumber: cert.user_id ? `ID-${cert.user_id.substring(0, 7).toUpperCase()}` : `LIC-${code}`,
        signatoryName: "Prof. M. A. Ojo",
        signatoryTitle: "Registrar General, NIC Nigeria",
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
            {/* Action Bar — Client Component for Print/Share */}
            <CertificateActions verificationUrl={verificationUrl} />

            {/* Render High-Fidelity Premium Certificate */}
            <div className="w-full flex justify-center py-4 print:py-0">
                <PremiumCertificateView data={certData} />
            </div>

            <p className="mt-6 text-xs text-slate-400 font-mono print:hidden">
                Official Authenticity Verification URL: <Link href={verificationUrl} className="underline text-amber-400">{verificationUrl}</Link>
            </p>
        </div>
    )
}
