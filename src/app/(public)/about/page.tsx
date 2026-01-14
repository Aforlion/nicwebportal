import { ShieldCheck, Target, Eye, Award, Users } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="bg-secondary py-20 text-white">
                <div className="container mx-auto px-4">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        About the Institute
                    </h1>
                    <p className="max-w-3xl text-lg text-slate-300 md:text-xl">
                        The National Institute of Caregivers (NIC) is the apex professional body in Nigeria dedicated to the standardization, regulation, and professionalization of the caregiving industry.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div className="flex flex-col gap-6 rounded-2xl border bg-background p-8 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold text-secondary">Our Mission</h2>
                            <p className="text-lg text-muted-foreground">
                                To create a regulated and professional caregiving environment in Nigeria through standardized training, certification, and continuous professional development, ensuring the highest quality of care for all citizens.
                            </p>
                        </div>
                        <div className="flex flex-col gap-6 rounded-2xl border bg-background p-8 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                                <Eye className="h-6 w-6 text-accent" />
                            </div>
                            <h2 className="text-3xl font-bold text-secondary">Our Vision</h2>
                            <p className="text-lg text-muted-foreground">
                                To be the leading authority and reference point for excellence in caregiving throughout Nigeria and a model for professional care standards across the African continent.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mandate Details */}
            <section className="bg-muted/30 py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-secondary">Our Mandate & Functions</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                title: "Professional Standards",
                                desc: "Developing and enforcing codes of conduct and ethics for care professionals nationwide.",
                                icon: Award,
                            },
                            {
                                title: "Education & Licensing",
                                desc: "Accrediting training institutions and licensing qualified caregivers across various specialties.",
                                icon: Users,
                            },
                            {
                                title: "Facility Regulation",
                                desc: "Inspecting and regulating care facilities to ensure they meet national safety and quality metrics.",
                                icon: ShieldCheck,
                            },
                        ].map((mandate) => (
                            <div key={mandate.title} className="rounded-xl bg-white p-6 shadow-sm">
                                <mandate.icon className="mb-4 h-10 w-10 text-primary" />
                                <h3 className="mb-2 text-xl font-bold text-secondary">{mandate.title}</h3>
                                <p className="text-muted-foreground">{mandate.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership Placeholder */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-12 text-3xl font-bold text-secondary">Governing Council & Management</h2>
                    <div className="mx-auto max-w-4xl rounded-2xl border border-dashed p-12 text-muted-foreground">
                        <Users className="mx-auto mb-4 h-12 w-12 opacity-20" />
                        <p>Institutional leadership details and profiles are currently being updated.</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
