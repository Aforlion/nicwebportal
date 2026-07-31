import { Metadata } from "next"
import { MemberRegistrationForm } from "@/components/member-registration-form"
import Link from "next/link"
import { User, Building2, ArrowRight, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
    title: "Join NIC | Registration Portal",
    description: "Register with the National Institute of Caregivers as an individual caregiver or training/care facility.",
}

interface PageProps {
    searchParams: Promise<{ redirect?: string; type?: string }>
}

export default async function JoinPage({ searchParams }: PageProps) {
    const { redirect, type } = await searchParams
    const showForm = type === 'individual'

    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20 opacity-90" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        {showForm ? "Caregiver & Student Registration" : "Join the National Registry"}
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        {showForm 
                            ? "Complete your registration to receive your official NIC ID card, verify credentials, and access career advancement training."
                            : "Select your pathway to join the National Institute of Caregivers (NIC) Nigeria."
                        }
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 md:py-20 bg-background">
                <div className="container mx-auto px-4">
                    {!showForm ? (
                        /* Selector Gate */
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-secondary">Choose Registration Type</h2>
                                <p className="text-muted-foreground mt-2">Whether you are practicing care or managing an institution, we have a pathway for you.</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Caregiver / Student Path */}
                                <div className="bg-white border rounded-2xl p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors" />
                                    <div>
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-secondary mb-3">Individual Caregiver / Student</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                            For nursing assistants, home health aides, family caregivers, and students seeking professional licensing and certification.
                                        </p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex gap-2.5 text-xs text-secondary font-medium">
                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                                <span>Official NIC Caregiver Licensing & ID Card</span>
                                            </li>
                                            <li className="flex gap-2.5 text-xs text-secondary font-medium">
                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                                <span>CPD Tracking and Career Progression Tiers</span>
                                            </li>
                                            <li className="flex gap-2.5 text-xs text-secondary font-medium">
                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                                <span>Public Verification Registry Listing</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <Link href={`/join?type=individual${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`} className="mt-auto">
                                        <button className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-primary/20 flex items-center justify-center gap-2">
                                            Join as Caregiver <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>

                                {/* Care Facility / Training Partner Path */}
                                <div className="bg-white border rounded-2xl p-8 hover:border-accent/50 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -z-10 group-hover:bg-accent/10 transition-colors" />
                                    <div>
                                        <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-secondary mb-3">Facility / Training Center</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                            For care homes, hospitals, training centers, and caregiver agencies seeking institutional accreditation and listing.
                                        </p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex gap-2.5 text-xs text-secondary font-medium">
                                                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                                                <span>NIC Official Accreditation Certificate & Seal</span>
                                            </li>
                                            <li className="flex gap-2.5 text-xs text-secondary font-medium">
                                                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                                                <span>Register Students & Certified Curricula</span>
                                            </li>
                                            <li className="flex gap-2.5 text-xs text-secondary font-medium">
                                                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                                                <span>Manage Clinical Internships & Placements</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <Link href="/join/facility" className="mt-auto">
                                        <button className="w-full bg-accent hover:bg-accent/95 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-accent/20 flex items-center justify-center gap-2">
                                            Register Institution <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Visual Timeline Section */}
                            <div className="bg-slate-50 border rounded-3xl p-8 md:p-12 mt-16 max-w-4xl mx-auto shadow-sm">
                                <div className="text-center max-w-2xl mx-auto mb-12">
                                    <h3 className="text-2xl font-bold text-secondary">Student Certification Pathway</h3>
                                    <p className="text-muted-foreground text-sm mt-2">Our structured progression guarantees that all certified caregivers possess verified clinical skills and professional competency.</p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8 relative">
                                    {/* Progression Step 1 */}
                                    <div className="relative bg-white border p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4 shrink-0">
                                            1
                                        </div>
                                        <h4 className="font-bold text-secondary mb-2">Core Fundamentals</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Pass the Core Caregiver Fundamentals curriculum. This builds your theoretical knowledge of care standards.
                                        </p>
                                    </div>

                                    {/* Progression Step 2 */}
                                    <div className="relative bg-white border p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4 shrink-0">
                                            2
                                        </div>
                                        <h4 className="font-bold text-secondary mb-2">Chosen Specialisation</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Unlock and complete a specialized care module (e.g. Geriatric, Pediatric, or In-Home Care) to align with your career goals.
                                        </p>
                                    </div>

                                    {/* Progression Step 3 */}
                                    <div className="relative bg-white border p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4 shrink-0">
                                            3
                                        </div>
                                        <h4 className="font-bold text-secondary mb-2">Clinical Internship</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Complete hands-on practical hours at an accredited healthcare facility or care partner agency to verify clinical competency.
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center mt-12 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-4">
                                    <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                    </div>
                                    <p className="text-xs text-emerald-800 font-medium max-w-xl text-left leading-relaxed">
                                        <strong>Accredited Certification:</strong> Upon completing all three stages, students are awarded the official Nursing Assistant Certificate, receive a verified digital ID, and are listed in the public verification registry.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Main Form Split */
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
                    )}
                </div>
            </section>
        </div>
    )
}
