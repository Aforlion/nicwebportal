import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, GraduationCap, Laptop, Users } from "lucide-react"
import Link from "next/link"

const programs = [
    {
        id: "hca",
        title: "Healthcare Assistant (HCA)",
        description: "The foundational program for professional caregivers. Covers basic care, hygiene, safety, and patient communication.",
        duration: "12 Weeks",
        mode: "Blended",
        price: "₦75,000",
        features: ["Certification", "Practical Internship", "Employment Support"],
        category: "Foundational",
    },
    {
        id: "specialty-care",
        title: "Specialty Care Certification",
        description: "Expert training for Parkinson's Disease, Alzheimer's (Cognitive Rehab), and Diabetes Care management.",
        duration: "10 Weeks",
        mode: "Blended",
        price: "Contact Us",
        features: ["Specialized Support", "Cognitive Rehab", "Diabetes Care"],
        category: "Specialty",
    },
    {
        id: "personal-care",
        title: "Personal Care Assistant",
        description: "Maintaining dignity through hygiene, bathing, and grooming assistance for the vulnerable.",
        duration: "4 Weeks",
        mode: "Physical",
        price: "₦45,000",
        features: ["Activities of Daily Living", "Dignity Focus", "Hands-on Training"],
        category: "Foundational",
    },
]

export default function ProgramsPage() {
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Training & Certifications
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Elevate your career with our nationally recognized caregiver training programs. From foundational skills to specialized care management.
                    </p>
                </div>
            </section>

            {/* Program Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program) => (
                            <Card key={program.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className="mb-2">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                            {program.category}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl text-secondary">{program.title}</CardTitle>
                                    <CardDescription className="min-h-[60px]">{program.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            {program.duration}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Laptop className="h-4 w-4" />
                                            {program.mode}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {program.features.map((feature) => (
                                            <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <GraduationCap className="h-4 w-4 text-accent" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-4 border-t bg-muted/20 pt-6">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="text-xl font-bold text-secondary">{program.price}</span>
                                        <Button variant="link" className="p-0 text-primary" asChild>
                                            <Link href={`/programs/${program.id}`}>View Details</Link>
                                        </Button>
                                    </div>
                                    <Button className="w-full bg-primary" asChild>
                                        <Link href={`/enrol/${program.id}`}>Enroll Now</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t py-20 bg-accent/5">
                <div className="container mx-auto px-4 text-center">
                    <Users className="mx-auto mb-6 h-12 w-12 text-accent" />
                    <h2 className="mb-4 text-3xl font-bold text-secondary">Need Corporate Training?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                        We provide customized training solutions for care facilities, hospitals, and NGOs. Partner with NIC to certify your entire staff.
                    </p>
                    <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
                        <Link href="/contact">Partner with us</Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}
