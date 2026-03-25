import { getCertificateByCode } from "@/actions/student/certificate"
import { notFound } from "next/navigation"
import QRCodeDisplay from "@/components/certificate/qr-code-display"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params
    const cert = await getCertificateByCode(code)

    if (!cert) {
        notFound()
    }

    const studentName = cert.profiles?.full_name || cert.profiles?.email || "Student"
    const courseTitle = cert.programs?.title || "Program"
    const issueDate = new Date(cert.issue_date).toLocaleDateString("en-GB", {
        day: 'numeric', month: 'long', year: 'numeric'
    })

    // Absolute URL for QR code (assuming env var is set, fallback to localhost for dev)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${appUrl}/certificates/${code}`

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="w-full max-w-[800px] mb-6 flex justify-between items-center print:hidden">
                <Link href="/" className="font-bold text-lg flex items-center gap-2">
                    <Image src="/logo.jpg" alt="NIC" width={24} height={24} className="rounded" />
                    NIC Portal
                </Link>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()} className="print-hidden">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {/* Certificate Container */}
            <div className="bg-white text-center p-12 shadow-2xl border-4 border-double border-slate-200 w-full max-w-[800px] aspect-[1.414] flex flex-col items-center justify-between text-slate-800 relative overflow-hidden print:shadow-none print:border-none print:w-[100%] print:h-[100vh] print:m-0">

                {/* Decorative Background Elements & Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <Image src="/coat-of-arm.png" alt="Watermark" width={400} height={400} />
                </div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-[url('/pattern.png')] opacity-10" />

                <div className="w-full space-y-4 relative z-10">
                    {/* Logo Area */}
                    <div className="mx-auto flex flex-col items-center mb-6">
                        <Image 
                            src="/logo.jpg" 
                            alt="NIC Logo" 
                            width={80} 
                            height={80} 
                            className="mb-4 rounded-lg shadow-sm"
                        />
                        <div className="h-0.5 w-24 bg-slate-900 mb-2" />
                        <span className="text-slate-900 font-bold text-2xl tracking-tighter">NIC</span>
                    </div>

                    <h1 className="text-4xl font-serif text-slate-900 uppercase tracking-widest mb-1">Certificate</h1>
                    <p className="text-xl font-light uppercase text-slate-500 tracking-[0.2em] mb-8">of Completion</p>

                    <p className="text-lg italic text-slate-600">This is to certify that</p>

                    <h2 className="text-4xl font-bold font-serif my-4 capitalize text-slate-900 border-b-2 border-slate-200 inline-block px-8 pb-2">
                        {studentName}
                    </h2>

                    <p className="text-lg italic text-slate-600 mt-4">Has successfully completed the course</p>

                    <h3 className="text-2xl font-bold text-primary my-4 max-w-lg mx-auto">
                        {courseTitle}
                    </h3>

                    <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
                        Demonstrating commitment to excellence and professional development in caregiving services.
                    </p>
                </div>

                {/* Footer Section */}
                <div className="w-full flex justify-between items-end mt-8 pt-8 border-t border-slate-100 relative z-10">
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">National Institute Content</p>
                        <p className="text-xs text-slate-500">Official Certification Authority</p>
                        <p className="text-xs text-slate-400 mt-4">Date Issued: {issueDate}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        {/* Signature Area (Mock) */}
                        <div className="w-32 border-b border-slate-300 mb-2" />
                        <p className="text-xs font-serif italic text-slate-500">Director of Training</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <QRCodeDisplay value={verificationUrl} size={84} />
                        <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-wider">ID: {cert.certificate_number}</p>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-sm text-muted-foreground print:hidden">
                Verify this certificate at: <Link href={verificationUrl} className="underline">{verificationUrl}</Link>
            </p>
        </div>
    )
}
