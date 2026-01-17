import Link from "next/link"
import { POLICIES } from "@/lib/policies"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen,
    ShieldCheck,
    Scale,
    FileText,
    ArrowRight,
    Gavel,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RegulatoryLandingPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-secondary py-20 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 text-accent mb-4">
                            <Scale className="h-6 w-6" />
                            <span className="font-bold uppercase tracking-wider">Regulatory Framework</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Ensuring Excellence Through Accountability
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            The National Institute of Caregivers (NIC) operates under a robust regulatory framework
                            designed to protect care recipients, professionalize caregivers, and establish
                            national standards for institutional care in Nigeria.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Sidebar/Context */}
                        <div className="lg:col-span-1 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-secondary mb-4">Our Commitment</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Our policies are developed in consultation with healthcare experts,
                                    legal professionals, and international careging bodies to ensure they
                                    are both professionally defensible and culturally appropriate for the Nigerian context.
                                </p>
                            </div>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Compliance Benefits
                                    </h3>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li>National Professional Recognition</li>
                                        <li>Public Trust & Credibility</li>
                                        <li>Access to NIC Certified Staff</li>
                                        <li>Regulatory Safety Assurance</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <div className="p-6 bg-white rounded-2xl border shadow-sm">
                                <h3 className="font-bold text-secondary mb-2">Need Clarification?</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    For legal enquiries or interpretations of our frameworks, please contact our registry office.
                                </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/contact">Contact Legal Dept</a>
                                </Button>
                            </div>
                        </div>

                        {/* Policy Grid */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid gap-6 md:grid-cols-1">
                                {POLICIES.map((policy) => (
                                    <Card key={policy.slug} className="group hover:border-primary/50 transition-all duration-300">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
                                                        {policy.category.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-2xl font-bold text-secondary">{policy.title}</CardTitle>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                {policy.category === 'Accreditation' && <ShieldCheck className="h-6 w-6" />}
                                                {policy.category === 'Regulatory' && <Scale className="h-6 w-6" />}
                                                {policy.category === 'Ethics' && <Gavel className="h-6 w-6" />}
                                                {policy.category === 'Legal' && <FileText className="h-6 w-6" />}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-slate-600 text-base mb-6">
                                                {policy.description}
                                            </CardDescription>
                                            <Button variant="link" className="p-0 h-auto text-primary font-bold group-hover:translate-x-1 transition-transform" asChild>
                                                <Link href={`/regulatory/${policy.slug}`}>
                                                    View Framework <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
