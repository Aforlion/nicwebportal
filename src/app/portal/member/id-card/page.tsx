"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Download, QrCode, Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function MemberIDCardPage() {
    const [memberData, setMemberData] = useState<any>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadMemberData()
    }, [])

    const loadMemberData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: membership } = await supabase
                .from('memberships')
                .select('*, profiles!inner(*)')
                .eq('user_id', user.id)
                .single()

            if (membership) {
                setMemberData(membership)
            }
        }
    }

    const getVerificationUrl = () => {
        if (!memberData) return ''
        const memberId = memberData.nic_id || memberData.member_id || memberData.id
        return `https://nicnigeria.org/verify/member?id=${memberId}`
    }

    const getQrCodeUrl = () => {
        const verificationUrl = getVerificationUrl()
        if (!verificationUrl) return ''
        // Use the Google Charts QR Code API — no npm dependency needed
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}&bgcolor=ffffff&color=1e293b&margin=4`
    }

    const handleDownload = async () => {
        if (!cardRef.current) return
        setIsDownloading(true)
        try {
            const html2canvas = (await import('html2canvas-pro')).default
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            })
            const link = document.createElement('a')
            link.download = `NIC_ID_Card_${memberData?.profiles?.full_name?.replace(/\s+/g, '_') || 'Member'}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
            toast.success("ID card downloaded!")
        } catch (err) {
            console.error("Download error:", err)
            toast.error("Failed to download ID card. Please try printing instead.")
        } finally {
            setIsDownloading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (!memberData) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Digital ID Card</h1>
                    <p className="text-muted-foreground">Loading your ID card...</p>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    const getCategoryBadge = (category: string) => {
        const badges: Record<string, string> = {
            student: 'SNIC',
            associate: 'ANIC',
            full: 'MNIC',
            trainer: 'TNIC',
            institutional: 'INIC'
        }
        return badges[category] || 'NIC'
    }

    const getCategoryDisplay = (category: string) => {
        if (category === 'full') return 'Professional'
        return category.charAt(0).toUpperCase() + category.slice(1)
    }

    return (
        <div className="space-y-8">
            {/* Print-only styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #id-card-printable, #id-card-printable * { visibility: visible !important; }
                    #id-card-printable {
                        position: fixed !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 450px !important;
                    }
                }
            `}</style>

            <div className="print:hidden">
                <h1 className="text-3xl font-bold text-secondary">Digital ID Card</h1>
                <p className="text-muted-foreground">Your official professional identification as an NIC Member.</p>
            </div>

            <div className="flex flex-col items-center gap-8 py-4">
                {/* The Card */}
                <div
                    ref={cardRef}
                    id="id-card-printable"
                    className="w-full max-w-[450px] rounded-[24px] bg-secondary text-white shadow-2xl overflow-hidden relative border-4 border-slate-700/50"
                >
                    {/* Background Patterns */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                    <div className="h-full flex flex-col relative z-10">
                        {/* ID Header */}
                        <div className="bg-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-accent" />
                                <span className="font-bold tracking-tighter text-lg">NIC NIGERIA</span>
                            </div>
                            <Badge className="bg-accent text-secondary font-bold text-[10px] px-2 py-0">
                                {getCategoryBadge(memberData.category)}
                            </Badge>
                        </div>

                        <div className="flex-grow p-6 flex gap-6">
                            {/* Photo and QR Area */}
                            <div className="space-y-3 flex-shrink-0">
                                {/* Photo */}
                                <div className="h-28 w-28 rounded-2xl bg-slate-700 border-2 border-slate-600 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-4xl">
                                    {memberData.photo_url ? (
                                        <img src={memberData.photo_url} alt="Member" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                    ) : (
                                        memberData.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
                                    )}
                                </div>
                                {/* QR Code */}
                                <div className="bg-white p-1.5 rounded-lg">
                                    <img
                                        src={getQrCodeUrl()}
                                        alt="Verification QR Code"
                                        className="w-24 h-24 mx-auto"
                                        crossOrigin="anonymous"
                                    />
                                    <p className="text-[7px] font-bold text-slate-600 text-center mt-0.5 uppercase">Scan to Verify</p>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="flex-grow space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Full Name</p>
                                    <p className="text-lg font-bold leading-tight mt-1">{memberData.profiles?.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Member ID</p>
                                    <p className="text-base font-mono font-bold text-accent mt-1">{memberData.nic_id || memberData.member_id || 'Pending'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Category</p>
                                        <p className="text-sm font-bold mt-0.5">{getCategoryDisplay(memberData.category)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</p>
                                        <p className="text-sm font-bold mt-0.5 text-accent capitalize">{memberData.status}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Valid Until</p>
                                    <p className="text-sm font-bold mt-0.5">
                                        {memberData.expiry_date
                                            ? new Date(memberData.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white/5 backdrop-blur-md px-6 py-3 border-t border-white/10">
                            <p className="text-[9px] text-slate-400 text-center">
                                National Institute of Caregivers • www.nicnigeria.org • Verify at nicnigeria.org/verify
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 print:hidden">
                    <Button onClick={handleDownload} variant="outline" disabled={isDownloading}>
                        {isDownloading
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Downloading...</>
                            : <><Download className="mr-2 h-4 w-4" />Download Card</>
                        }
                    </Button>
                    <Button onClick={handlePrint} className="bg-primary">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Card
                    </Button>
                </div>

                {/* Info Card */}
                <Card className="w-full max-w-[450px] print:hidden">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-secondary mb-2">About Your Digital ID</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>This digital ID card serves as proof of your professional certification with NIC</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <QrCode className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>The QR code can be scanned by employers or clients to instantly verify your credentials</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Download className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Download or print your ID card to carry with you during professional engagements</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
