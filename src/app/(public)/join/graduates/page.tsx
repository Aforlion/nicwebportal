import { Metadata } from "next"
import { MemberRegistrationForm } from "@/components/member-registration-form"
import { CheckCircle2, Award, Zap, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
    title: "Graduate Onboarding | NIC Professional Membership",
    description: "Finalize your professional status as a NIC graduate and claim your certification.",
}

export default function GraduateJoinPage() {
    return (
        <div className="pb-20">
            {/* Header / Hero Section */}
            <section className="bg-gradient-to-br from-primary to-secondary py-20 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                        <Award className="h-4 w-4 text-accent" />
                        <span>Exclusive for NIC Graduates</span>
                    </div>
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl italic">
                        Claim Your Professional Status
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg md:text-xl opacity-90 leading-relaxed italic">
                        Congratulations on completing your training. You are now eligible to join the national registry and receive your professional Fundamental Course Certificate.
                    </p>
                </div>
            </section>

            {/* Power Positioning RoadMap */}
            <section className="py-16 bg-slate-50 border-y">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-4">
                        {[
                            { step: "01", title: "Registration", desc: "Complete your professional profile below", icon: Zap },
                            { step: "02", title: "Activation", desc: "Pay the ₦5,000 professional fee", icon: ShieldCheck },
                            { step: "03", title: "Orientation", desc: "Short standards & ethics session", icon: Award },
                            { step: "04", title: "Certified", desc: "Immediate digital certificate access", icon: CheckCircle2 },
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md hover:-translate-y-1">
                                    <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                        <item.icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <span className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Step {item.step}</span>
                                    <h3 className="font-bold text-secondary text-lg mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                                {idx < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-slate-200 z-0"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Join Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto mb-16 text-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4 italic">Why Register as a NIC Professional?</h2>
                        <p className="text-muted-foreground italic text-lg">Your training is just the beginning. Official registration unlocks your career potential.</p>
                    </div>
                    <div className="grid gap-10 md:grid-cols-2">
                        <div className="space-y-8">
                            {[
                                { title: "National Recognition", desc: "Join the authoritative database of certified caregivers in Nigeria, searchable by top healthcare employers." },
                                { title: "Professional Credentials", desc: "Receive your official digital certificate and permanent membership ID number instantly." },
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex gap-4 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <div className="mt-1"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-secondary mb-1">{benefit.title}</h4>
                                        <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-8">
                            {[
                                { title: "Career Opportunities", desc: "Gain exclusive access to job postings from NIC-vetted facilities and home care agencies." },
                                { title: "Continuous Standard", desc: "Align yourself with the highest ethical and professional standards of caregiving in the country." },
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="mt-1"><CheckCircle2 className="h-6 w-6 text-primary" /></div>
                                    <div>
                                        <h4 className="font-bold text-secondary mb-1">{benefit.title}</h4>
                                        <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section className="py-20 bg-slate-50 border-t">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold text-secondary mb-2 italic">Graduate Onboarding</h2>
                        <p className="text-muted-foreground italic">Fill in your details to finalize your membership</p>
                    </div>
                    <MemberRegistrationForm lockCategory="student" isGraduate={true} />
                </div>
            </section>
        </div>
    )
}
