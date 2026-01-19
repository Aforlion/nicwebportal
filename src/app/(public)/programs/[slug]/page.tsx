import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Globe, Shield, PlayCircle, Lock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/actions/get-courses"

export default async function CoursePage({ params }: { params: { slug: string } }) {
    const course = await getCourseBySlug(params.slug)

    if (!course) {
        notFound()
    }

    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="bg-primary pt-20 pb-24 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <div className="mb-6 flex gap-2">
                                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0">
                                    {course.level}
                                </Badge>
                                {course.duration_hours && (
                                    <Badge variant="outline" className="text-white border-white/30">
                                        {course.duration_hours} Hours
                                    </Badge>
                                )}
                            </div>
                            <h1 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
                                {course.title}
                            </h1>
                            <p className="mb-8 text-lg opacity-90 leading-relaxed">
                                {course.description}
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-14 text-lg px-8" asChild>
                                    <Link href={`/portal/student/enroll/${course.id}`}>
                                        Enroll Now - {course.price > 0 ? `₦${course.price.toLocaleString()}` : 'Free'}
                                    </Link>
                                </Button>
                                <div className="flex items-center gap-2 text-sm opacity-80 px-2">
                                    <Shield className="h-4 w-4" />
                                    <span>Official NIC Certification</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            {/* Video Placeholder or Thumbnail */}
                            <div className="aspect-video w-full rounded-2xl bg-white/10 p-2 ring-1 ring-white/20">
                                <div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden group">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-secondary/80" />
                                    )}
                                    <div className="z-10 bg-white/10 backdrop-blur-sm p-4 rounded-full group-hover:bg-white/20 transition-all cursor-pointer">
                                        <PlayCircle className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curriculum Section */}
            <section className="container mx-auto px-4 -mt-12 relative z-10 grid gap-8 lg:grid-cols-3">
                {/* Main Content: Syllabus */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card rounded-2xl shadow-sm border p-8">
                        <h3 className="text-2xl font-bold mb-6">Course Curriculum</h3>

                        <div className="space-y-4">
                            {course.modules?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((module: any, index: number) => (
                                <div key={module.id} className="border rounded-lg overflow-hidden">
                                    <div className="bg-muted/30 px-6 py-4 border-b flex items-center justify-between">
                                        <h4 className="font-semibold text-lg">Module {index + 1}: {module.title}</h4>
                                        <span className="text-sm text-muted-foreground">{module.lessons?.length || 0} Lessons</span>
                                    </div>
                                    <div className="divide-y">
                                        {module.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((lesson: any) => (
                                            <div key={lesson.id} className="px-6 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    {lesson.is_preview ? (
                                                        <PlayCircle className="h-4 w-4 text-primary" />
                                                    ) : (
                                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <span className={lesson.is_preview ? "text-foreground" : "text-muted-foreground"}>{lesson.title}</span>
                                                </div>
                                                {lesson.duration_minutes && (
                                                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                                                        {lesson.duration_minutes} min
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {(!course.modules || course.modules.length === 0) && (
                                <div className="text-center py-12 text-muted-foreground border-dashed border-2 rounded-lg">
                                    Curriculum is being updated.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Details */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-2xl shadow-sm border p-6 sticky top-24 space-y-6">
                        <h3 className="font-bold text-xl">This course includes:</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Globe className="h-5 w-5 text-primary" />
                                <span>100% Online & Self-Paced</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Clock className="h-5 w-5 text-primary" />
                                <span>Lifetime Access</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <span>Certificate of Completion</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Shield className="h-5 w-5 text-primary" />
                                <span>NIC Accredited</span>
                            </li>
                        </ul>
                        <hr />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">
                                {course.price > 0 ? `₦${course.price.toLocaleString()}` : 'Free'}
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">One-time payment</p>
                            <Button className="w-full h-12 text-lg" asChild>
                                <Link href={`/portal/student/enroll/${course.id}`}>Enroll Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
