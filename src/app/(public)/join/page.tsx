import { Metadata } from "next"
import { MemberRegistrationForm } from "@/components/member-registration-form"

export const metadata: Metadata = {
    title: "Join NIC | Member Registration",
    description: "Register as a member of the National Institute of Caregivers",
}

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
    const { redirect } = await searchParams
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Become a Member
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Join the national community of professional caregivers. Complete your registration below to receive your membership ID and access exclusive benefits.
                    </p>
                </div>
            </section>

            {/* Main Content: Form + Sidebar Guide */}
            <section className="py-12 md:py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        
                        {/* Left Column: Registration Form */}
                        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                            <div className="bg-white p-1 rounded-2xl shadow-sm border">
                                <MemberRegistrationForm redirectUrl={redirect} />
                            </div>
                        </div>

                        {/* Right Column: Sticky Guide Sidebar */}
                        <div className="lg:col-span-1 space-y-8 order-1 lg:order-2 lg:sticky lg:top-24">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary mb-2">Registration Guide</h2>
                                    <p className="text-muted-foreground text-sm">Everything you need to know about joining the NIC.</p>
                                </div>

                                {/* Why Join Segment */}
                                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Why Join NIC?</h3>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-sm text-secondary items-start">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <span><strong>National Recognition:</strong> Official ID recognized across Nigeria.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm text-secondary items-start">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <span><strong>CPD Credits:</strong> Earn points for professional license renewal.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm text-secondary items-start">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <span><strong>Global Visibility:</strong> Featured in the Public Registry for employers.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Individual Progression */}
                                <div className="bg-slate-50 border p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        </div>
                                        <h3 className="font-bold text-secondary">Individual Tiers</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative pl-6 border-l-2 border-slate-200 py-1">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-slate-300" />
                                            <p className="text-xs font-bold text-secondary">Student Member</p>
                                            <p className="text-[11px] text-muted-foreground">Foundation training starts here.</p>
                                        </div>
                                        <div className="relative pl-6 border-l-2 border-blue-400 py-1">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-blue-400" />
                                            <p className="text-xs font-bold text-secondary">Associate Member</p>
                                            <p className="text-[11px] text-muted-foreground">For caregivers with basic experience.</p>
                                        </div>
                                        <div className="relative pl-6 border-l-2 border-primary py-1">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-primary" />
                                            <p className="text-xs font-bold text-secondary">Professional Member (MNIC)</p>
                                            <p className="text-[11px] text-muted-foreground">Expert level with full voting rights.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Facility Path */}
                                <div className="bg-slate-50 border p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M15 18h.01"/><path d="M9 18h.01"/></svg>
                                        </div>
                                        <h3 className="font-bold text-secondary">Facility Accreditation</h3>
                                    </div>
                                    <ol className="space-y-3">
                                        <li className="flex gap-3 text-[11px] text-muted-foreground">
                                            <span className="font-bold text-primary">01</span>
                                            <span>Document submission & verification fee payment.</span>
                                        </li>
                                        <li className="flex gap-3 text-[11px] text-muted-foreground">
                                            <span className="font-bold text-primary">02</span>
                                            <span>On-site inspection and staff quality assessment.</span>
                                        </li>
                                        <li className="flex gap-3 text-[11px] text-muted-foreground">
                                            <span className="font-bold text-primary">03</span>
                                            <span>Pillar-based scoring & listing in NIC Registry.</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}
