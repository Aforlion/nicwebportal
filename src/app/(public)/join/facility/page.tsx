import { Metadata } from "next"
import { FacilityRegistrationForm } from "@/components/facility-registration-form"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Facility Registration | NIC",
    description: "Register your care facility as a certified NIC Care Partner",
}

export default function FacilityJoinPage() {
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Institutional Registration
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Join the NIC Institutional Registry. Register your Nursing Home, Hospital, or Agency to access verified caregiving talent and professional certification for your facility.
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
                                <FacilityRegistrationForm />
                            </div>
                        </div>

                        {/* Right Column: Sticky Guide Sidebar */}
                        <div className="lg:col-span-1 space-y-8 order-1 lg:order-2 lg:sticky lg:top-24">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary mb-2">Institutional Guide</h2>
                                    <p className="text-muted-foreground text-sm">Everything you need to know about partnering with the NIC.</p>
                                </div>

                                {/* Why Join Segment */}
                                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Why Register?</h3>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-sm text-secondary items-start">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <span><strong>Verified Talent:</strong> Hire directly from the national registry of certified caregivers.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm text-secondary items-start">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <span><strong>Public Trust:</strong> Display the official NIC Seal of Accreditation.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm text-secondary items-start">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <span><strong>Standardization:</strong> Align your operations with national caregiving standards.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Facility Path */}
                                <div className="bg-slate-50 border p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M15 18h.01"/><path d="M9 18h.01"/></svg>
                                        </div>
                                        <h3 className="font-bold text-secondary">Accreditation Process</h3>
                                    </div>
                                    <ol className="space-y-4">
                                        <div className="relative pl-6 border-l-2 border-slate-200 py-1">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-slate-300" />
                                            <p className="text-xs font-bold text-secondary">1. Registration & Payment</p>
                                            <p className="text-[11px] text-muted-foreground">Submit details and pay the ₦100,000 facility fee.</p>
                                        </div>
                                        <div className="relative pl-6 border-l-2 border-amber-400 py-1">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-amber-400" />
                                            <p className="text-xs font-bold text-secondary">2. Documentation Review</p>
                                            <p className="text-[11px] text-muted-foreground">NIC verifies your operating licenses and compliance.</p>
                                        </div>
                                        <div className="relative pl-6 border-l-2 border-primary py-1">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-primary" />
                                            <p className="text-xs font-bold text-secondary">3. Public Registry Listing</p>
                                            <p className="text-[11px] text-muted-foreground">Receive certification and join our national database.</p>
                                        </div>
                                    </ol>
                                </div>

                                {/* Individual Progression */}
                                <div className="bg-slate-50 border p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        </div>
                                        <h3 className="font-bold text-secondary">Individual Registry</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Are you an individual caregiver looking to get certified?
                                    </p>
                                    <Link href="/join" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                        Register as an Individual 
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                    </Link>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}
