import { Metadata } from "next"
import { MemberRegistrationForm } from "@/components/member-registration-form"

export const metadata: Metadata = {
    title: "Join NIC | Member Registration",
    description: "Register as a member of the National Institute of Caregivers",
}

export default function JoinPage() {
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

            {/* Registration Guide */}
            <section className="py-12 bg-slate-50 border-b">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-center text-secondary">Registration & Progression Guide</h2>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-secondary">Individual Caregivers</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Our 4-tier education system ensures professional growth through structured learning paths.
                                </p>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <span><strong>Student Members:</strong> Access to Foundation (Level 1) courses.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <span><strong>Associate Members:</strong> Access to Foundation & Intermediate (Level 2) courses.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <span><strong>Pro Members:</strong> Access to all levels including Advanced (Level 3) courses.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M15 18h.01"/><path d="M9 18h.01"/></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-secondary">Care Facilities</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Facilities undergo a rigorous 6-pillar accreditation process to ensure standard of care.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-medium p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="h-6 w-6 rounded bg-primary text-white flex items-center justify-center text-xs">1</div>
                                        <span>Online Application & Fee</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="h-6 w-6 rounded bg-primary text-white flex items-center justify-center text-xs">2</div>
                                        <span>Self-Assessment & Documents</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="h-6 w-6 rounded bg-primary text-white flex items-center justify-center text-xs">3</div>
                                        <span>Inspection & Pillar Scoring</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <MemberRegistrationForm />
                </div>
            </section>
        </div>
    )
}
