import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, GraduationCap, Laptop, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { getPublishedCourses } from "@/actions/get-courses"

export default async function ProgramsPage() {
    const programs = await getPublishedCourses()

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
                    {programs.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-xl">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-secondary">No Courses Available Yet</h3>
                            <p className="text-muted-foreground mt-2">New training programs are being added. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {programs.map((program: any) => (
                                <Card key={program.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                                    <div className="aspect-video w-full bg-slate-100 relative">
                                        {/* Placeholder for thumbnail if not present */}
                                        {program.thumbnail_url ? (
                                            <img src={program.thumbnail_url} alt={program.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                                                <GraduationCap size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="pb-4">
                                        <div className="mb-2">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                                {program.level || "Certification"}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl text-secondary line-clamp-2">{program.title}</CardTitle>
                                        <CardDescription className="line-clamp-3 min-h-[60px]">{program.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {program.duration_hours ? `${program.duration_hours} Hours` : 'Self-paced'}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Laptop className="h-4 w-4" />
                                                Online
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-4 border-t bg-muted/20 pt-6">
                                        <div className="flex w-full items-center justify-between">
                                            <span className="text-xl font-bold text-secondary">
                                                {program.price > 0 ? `₦${program.price.toLocaleString()}` : "Free"}
                                            </span>
                                            <Button variant="link" className="p-0 text-primary" asChild>
                                                <Link href={`/programs/${program.slug}`}>View Syllabus</Link>
                                            </Button>
                                        </div>
                                        <Button className="w-full bg-primary" asChild>
                                            <Link href={`/portal/student/enroll/${program.id}`}>Enroll Now</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
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
