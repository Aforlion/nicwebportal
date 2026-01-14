import { Button } from "@/components/ui/button"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle2, UserPlus, Award, BookOpen, Briefcase, Zap } from "lucide-react"
import Link from "next/link"

const categories = [
    {
        id: "student",
        title: "Student Member",
        description: "For individuals currently enrolled in an NIC-accredited training program.",
        eligibility: "Evidence of current enrollment in HCA or Specialty training.",
        fee: "₦5,000 / Year",
    },
    {
        id: "associate",
        title: "Associate Member",
        description: "For certified caregivers with less than 3 years of professional experience.",
        eligibility: "NIC-accredited HCA certification or equivalent.",
        fee: "₦15,000 / Year",
    },
    {
        id: "full",
        title: "Full Member (MNIC)",
        description: "The standard professional designation for experienced, certified caregivers.",
        eligibility: "HCA certification + 3 years experience or Degree in Related field + 1 year experience.",
        fee: "₦25,000 / Year",
    },
    {
        id: "trainer",
        title: "Trainer Member",
        description: "For professionals qualified to lead NIC-accredited training programs.",
        eligibility: "Expert certification + Training of Trainers (ToT) qualification.",
        fee: "₦40,000 / Year",
    },
    {
        id: "institutional",
        title: "Institutional Member",
        description: "For care facilities, hospitals, and agencies registered with NIC.",
        eligibility: "Evidence of facility registration and compliance with NIC standards.",
        fee: "₦100,000 / Year",
    },
]

const benefits = [
    { title: "Professional Designation", desc: "Right to use post-nominal letters (e.g., MNIC).", icon: Award },
    { title: "LMS Access", desc: "Full access to our digital learning library and resources.", icon: BookOpen },
    { title: "Job Board", desc: "Priority access to vacancies from registered care facilities.", icon: Briefcase },
    { title: "CPD Credits", desc: "Automatic tracking of continuing professional development.", icon: Zap },
]

export default function MembershipPage() {
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-secondary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Membership & Professional Body
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Join the national community of caregivers. Elevate your status, access exclusive resources, and stay compliant with national standards.
                    </p>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-secondary">Why Join NIC?</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit) => (
                            <div key={benefit.title} className="flex flex-col items-center text-center p-6 rounded-2xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                                    <benefit.icon className="h-8 w-8 text-accent" />
                                </div>
                                <h3 className="mb-2 font-bold text-secondary">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="bg-muted/30 py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="mb-12 text-center text-3xl font-bold text-secondary">Membership Categories</h2>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {categories.map((cat) => (
                            <AccordionItem key={cat.id} value={cat.id} className="border bg-background px-6 rounded-lg">
                                <AccordionTrigger className="hover:no-underline py-6">
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-xl font-bold text-secondary">{cat.title}</span>
                                        <span className="text-sm text-primary font-medium">{cat.fee}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-muted-foreground">
                                    <div className="space-y-4">
                                        <p>{cat.description}</p>
                                        <div className="rounded-md bg-muted p-4">
                                            <p className="text-sm font-semibold text-secondary flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                Eligibility
                                            </p>
                                            <p className="text-sm mt-1">{cat.eligibility}</p>
                                        </div>
                                        <Button className="w-full bg-primary" asChild>
                                            <Link href={`/join?category=${cat.id}`}>Apply for {cat.title}</Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Join CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto max-w-2xl rounded-3xl bg-primary px-8 py-12 text-white shadow-xl">
                        <UserPlus className="mx-auto mb-6 h-12 w-12 text-accent" />
                        <h2 className="mb-4 text-3xl font-bold">Start Your Professional Journey</h2>
                        <p className="mb-8 opacity-90">
                            Registration is open for the current cycle. Join now to receive your digital ID and access the membership portal.
                        </p>
                        <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100" asChild>
                            <Link href="/join">Register Now</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
