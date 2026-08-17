import { ShieldCheck, Target, Eye, Award, Users, Crown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

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
                                To raise the standards in caregiving, increase awareness of the critical role caregivers play in society, and promote policies that support and empower them.
                            </p>
                        </div>
                        <div className="flex flex-col gap-6 rounded-2xl border bg-background p-8 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                                <Eye className="h-6 w-6 text-accent" />
                            </div>
                            <h2 className="text-3xl font-bold text-secondary">Our Vision</h2>
                            <p className="text-lg text-muted-foreground">
                                To train trainers in the care industry to provide the best-needed care services to the vulnerable across all demographics. We aim to raise standards to ensure senior citizens receive the dignity and care they deserve.
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

            {/* Core Values */}
            <section className="bg-primary/5 py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-secondary">Our Core Values</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: "Integrity", desc: "Honesty and strong moral principles in all our dealings." },
                            { title: "Professionalism", desc: "Excellence and competence in caregiving practice." },
                            { title: "Teamwork", desc: "Collaborative effort to achieve the best care outcomes." },
                            { title: "Caregiving", desc: "Dedicated support for the vulnerable and needy." },
                            { title: "Service", desc: "Commitment to serving humanity with diligence." },
                            { title: "Empathy", desc: "Understanding and sharing the feelings of those under care." },
                        ].map((value) => (
                            <div key={value.title} className="rounded-xl border bg-background p-6 text-center">
                                <h3 className="mb-2 text-xl font-bold text-primary">{value.title}</h3>
                                <p className="text-muted-foreground">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founding Members CTA */}
            <section className="py-16 bg-amber-50/50 border-y border-amber-100">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Crown className="h-6 w-6 text-amber-600" />
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-secondary">Our Founding Members</h2>
                    <p className="mb-8 max-w-2xl mx-auto text-lg text-muted-foreground">
                        NIC stands on the shoulders of giants. We honor the distinguished professionals who laid the cornerstone of this institute and supported our recapitalization.
                    </p>
                    <Link href="/about/founding-members">
                        <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 shadow-lg shadow-amber-600/20">
                            View Founding Members Roll of Honor
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-secondary">Governing Council & Management</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { name: "Victor Olusan", role: "Director-General", desc: "Economist and ACA certified caregiver.", image: "/team/victor-olusan.jpg" },
                            { name: "Afolayan Olatunji Joel", role: "Executive Director, Programmes & Strategic Development", desc: "Strategic program development, institutional expansion, and management.", image: "/team/afolayan-joel.jpg" },
                            { name: "Barr. Godwin Okuja", role: "Executive Director, Legal & Regulatory Affairs", desc: "Principal Partner at Okuja & Associates." },
                            { name: "Abraham P. Olanrewaju", role: "Executive Director, Corporate Affairs & Communications", desc: "Media, publicity, and strategic corporate communications expert." },
                            { name: "Mohammed Kazeem Oladimeji", role: "Executive Director, Operations & Administration", desc: "Administrative expert and certified caregiver." },
                            { name: "Alimot E. Afe", role: "Executive Director, Regulatory Secretariat", desc: "Lawyer and peace & conflict resolution focus." },
                            { name: "Zainab Gafar Babatunde", role: "Executive Director, Training & Accreditation", desc: "Registered Nurse and Midwife (RN, RM)." },
                            { name: "Dr. Mrs. Gladys Olufunke Etim", role: "Executive Director, Institutional Governance", desc: "Experienced organization leader and strategist." },
                            { name: "Desmond Onyemechi Okocha", role: "Executive Director, Research & Public Relations", desc: "PhD in Mass Communication." },
                        ].map((member) => (
                            <div key={member.name} className="flex flex-col items-center rounded-2xl border bg-background p-6 text-center shadow-sm hover:shadow-md transition-all duration-200">
                                {member.image ? (
                                    <div className="mb-4 relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
                                        <Users className="h-9 w-9 text-secondary" />
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-secondary">{member.name}</h3>
                                <p className="mb-2 text-sm font-medium text-primary">{member.role}</p>
                                <p className="text-xs text-muted-foreground">{member.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
