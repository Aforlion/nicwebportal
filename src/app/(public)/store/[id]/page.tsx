"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileDown,
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    Star,
    BookOpen,
    Lock
} from "lucide-react"
import Link from "next/link"

export default function ProductDetailsPage({ params: _params }: { params: { id: string } }) { // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (
        <div className="container mx-auto px-4 py-20">
            <Button variant="ghost" className="mb-8" asChild>
                <Link href="/store">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
                </Link>
            </Button>

            <div className="grid gap-12 lg:grid-cols-2">
                {/* Visual / Cover */}
                <div className="aspect-[3/4] rounded-3xl bg-secondary/10 border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center p-12 text-center">
                    <BookOpen className="h-32 w-32 text-secondary opacity-20 mb-6" />
                    <h3 className="text-2xl font-bold text-secondary opacity-40 uppercase tracking-widest">Official NIC Publication</h3>
                    <div className="mt-12 p-4 bg-white rounded-2xl shadow-xl max-w-xs rotate-3 border">
                        <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                        <p className="font-bold text-secondary text-sm">National Caregiver Standard Manual</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Authorized Digital Edition</p>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-8">
                    <div>
                        <Badge className="bg-primary mb-4">Official Publication</Badge>
                        <h1 className="text-4xl font-extrabold text-secondary tracking-tight">National Caregiver Standard Manual (2024)</h1>
                        <div className="mt-4 flex items-center gap-6">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="h-4 w-4 fill-current" />
                                4.8 <span className="text-muted-foreground font-normal text-sm">(124 Reviews)</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                                <CheckCircle2 className="h-4 w-4" /> Verified Resource
                            </div>
                        </div>
                    </div>

                    <div className="text-3xl font-black text-secondary">
                        ₦12,500
                    </div>

                    <div className="prose prose-slate max-w-none text-muted-foreground">
                        <p className="text-lg leading-relaxed">
                            This is the definitive guide to professional caregiving in Nigeria. Developed by the NIC Council, this manual outlines the mandatory clinical standards, ethical protocols, and legal frameworks for all registered health assistants and specialists.
                        </p>
                        <ul className="grid gap-2 mt-6">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Comprehensive Clinical Ethics</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Patient Rights & Data Privacy</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Emergency Response Protocols</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Includes 2024 Regulatory Updates</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button size="lg" className="h-14 px-12 bg-primary text-lg font-bold flex-grow sm:flex-grow-0">
                            <FileDown className="mr-2 h-5 w-5" /> Buy & Download PDF
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 h-14 border-secondary text-secondary">
                            Request Print Edition
                        </Button>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border flex items-start gap-4">
                        <Lock className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                        <p className="text-xs text-muted-foreground">
                            Your digital download is cryptographically locked to your NIC account. Unauthorized distribution is monitored by the Integrity Unit. 100% Secure encrypted transaction via Paystack.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
