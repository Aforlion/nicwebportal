import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { ShieldCheck, Download, Share2, QrCode, Printer } from "lucide-react"

export default function MemberIDCardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Digital ID Card</h1>
                <p className="text-muted-foreground">Your official professional identification as an NIC Member.</p>
            </div>

            <div className="flex flex-col items-center gap-12 py-8">
                {/* The Card */}
                <div className="w-full max-w-[450px] aspect-[1.586/1] rounded-[24px] bg-secondary text-white shadow-2xl overflow-hidden relative border-4 border-slate-700/50">
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
                            <Badge className="bg-accent text-secondary font-bold text-[10px] px-2 py-0">MNIC</Badge>
                        </div>

                        <div className="flex-grow p-6 flex gap-6">
                            {/* Photo Area */}
                            <div className="space-y-3">
                                <div className="h-32 w-32 rounded-2xl bg-slate-700 border-2 border-slate-600 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-4xl">
                                    GO
                                </div>
                                <div className="text-center">
                                    <QrCode className="h-16 w-16 mx-auto opacity-50" />
                                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Scan to Verify</p>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="flex-grow space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Full Name</p>
                                    <p className="text-xl font-bold leading-tight mt-1">Grace Obi</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Member ID</p>
                                    <p className="text-lg font-mono font-bold text-accent mt-1">NIC-MEM-5502</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Expiry</p>
                                        <p className="text-sm font-bold mt-1">03/2025</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Level</p>
                                        <p className="text-sm font-bold mt-1 text-emerald-400">Full</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-primary/10 flex items-center justify-between">
                            <p className="text-[9px] font-medium text-slate-400">NATIONAL INSTITUTE OF CAREGIVERS</p>
                            <div className="h-6 w-16 opacity-30 bg-slate-400 rounded-sm" /> {/* Placeholder for signature */}
                        </div>
                    </CardContent>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" className="bg-primary">
                        <Download className="mr-2 h-5 w-5" />
                        Download PDF
                    </Button>
                    <Button size="lg" variant="outline" className="border-secondary text-secondary">
                        <Printer className="mr-2 h-5 w-5" />
                        Print Card
                    </Button>
                    <Button size="lg" variant="ghost">
                        <Share2 className="mr-2 h-5 w-5" />
                        Share
                    </Button>
                </div>

                {/* Informational Text */}
                <div className="max-w-2xl text-center space-y-4">
                    <p className="text-muted-foreground text-sm">
                        This digital ID card is a valid professional credential for all NIC certified members. You can present this at registered care facilities or government inspections for verification.
                    </p>
                    <div className="p-4 bg-muted/50 rounded-lg text-xs flex items-start gap-3 text-left">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                        <p>
                            **Security Notice:** Every NIC ID card contains a unique encrypted QR code. Tampering with or forging this document is a federal offense under the Professional Care Body Act.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
            {children}
        </span>
    )
}
