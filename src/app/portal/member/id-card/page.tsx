"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Download, QrCode, Printer } from "lucide-react"
import QRCode from "qrcode"

export default function MemberIDCardPage() {
    const [qrCodeUrl, setQrCodeUrl] = useState("")
    const [memberData, setMemberData] = useState<any>(null)

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
                // Generate QR code with verification URL
                const verificationUrl = `${window.location.origin}/verify/member?id=${membership.nic_id || membership.member_id}`
                const qr = await QRCode.toDataURL(verificationUrl, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#1e293b',
                        light: '#ffffff'
                    }
                })
                setQrCodeUrl(qr)
            }
        }
    }

    const handleDownload = () => {
        // TODO: Implement ID card download as image/PDF
        console.log("Download ID card")
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Digital ID Card</h1>
                <p className="text-muted-foreground">Your official professional identification as an NIC Member.</p>
            </div>

            <div className="flex flex-col items-center gap-8 py-8">
                {/* The Card */}
                <div className="w-full max-w-[450px] aspect-[1.586/1] rounded-[24px] bg-secondary text-white shadow-2xl overflow-hidden relative border-4 border-slate-700/50 print:shadow-none print:border-2">
                    {/* Background Patterns */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                    <CardContent className="h-full p-0 flex flex-col relative z-10">
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
                            <div className="space-y-3">
                                {/* Photo */}
                                <div className="h-32 w-32 rounded-2xl bg-slate-700 border-2 border-slate-600 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-4xl">
                                    {memberData.photo_url ? (
                                        <img src={memberData.photo_url} alt="Member" className="w-full h-full object-cover" />
                                    ) : (
                                        memberData.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                                    )}
                                </div>
                                {/* QR Code */}
                                <div className="text-center bg-white p-2 rounded-lg">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto" />
                                    ) : (
                                        <QrCode className="h-16 w-16 mx-auto opacity-50 text-slate-400" />
                                    )}
                                    <p className="text-[8px] font-bold text-slate-600 mt-1 uppercase">Scan to Verify</p>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="flex-grow space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Full Name</p>
                                    <p className="text-xl font-bold leading-tight mt-1">{memberData.profiles?.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Member ID</p>
                                    <p className="text-lg font-mono font-bold text-accent mt-1">{memberData.nic_id || memberData.member_id}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Category</p>
                                        <p className="text-sm font-bold mt-0.5 capitalize">{memberData.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</p>
                                        <p className="text-sm font-bold mt-0.5 capitalize text-accent">{memberData.status}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Valid Until</p>
                                    <p className="text-sm font-bold mt-0.5">{new Date(memberData.expiry_date).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white/5 backdrop-blur-md px-6 py-3 border-t border-white/10">
                            <p className="text-[9px] text-slate-400 text-center">
                                National Institute of Caregivers • www.nicnigeria.org • Verify at nicnigeria.org/verify
                            </p>
                        </div>
                    </CardContent>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 print:hidden">
                    <Button onClick={handleDownload} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Card
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
