import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Globe, Shield, PlayCircle, Lock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/actions/get-courses"
import { RichText } from "@/components/ui/rich-text"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const course = await getCourseBySlug(slug)

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
                            <CollapsibleRichText
                                content={course.description}
                                contentClassName="text-lg leading-relaxed text-white/90"
                                className="mb-8 opacity-90"
                                maxHeight={200}
                                buttonClassName="text-white hover:text-white/80"
                                maskClassName="from-primary/80"
                            />
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
                            <Accordion type="single" collapsible defaultValue={course.modules?.[0]?.id} className="w-full space-y-4">
                                {(course.modules || []).map((module: any, index: number) => (
                                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg overflow-hidden bg-white/50">
                                        <AccordionTrigger className="bg-muted/30 px-6 py-4 border-b hover:no-underline hover:bg-muted/50 transition-colors group">
                                            <div className="flex items-center justify-between w-full pr-4 text-left">
                                                <div>
                                                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Module {index + 1}</span>
                                                    <h4 className="font-bold text-lg">{module.title}</h4>
                                                </div>
                                                <span className="text-sm text-muted-foreground whitespace-nowrap">{module.lessons?.length || 0} Lessons</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                            <div className="px-6 py-4 bg-muted/10 border-b">
                                                {module.description && (
                                                    <CollapsibleRichText
                                                        content={module.description}
                                                        contentClassName="text-sm text-muted-foreground"
                                                        className="mb-4"
                                                        maxHeight={100}
                                                    />
                                                )}
                                            </div>
                                            <div className="divide-y">
                                                {[...(module.lessons || [])].sort((a: any, b: any) => a.sort_order - b.sort_order).map((lesson: any) => (
                                                    <div key={lesson.id} className="px-6 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors group/lesson">
                                                        {lesson.is_preview ? (
                                                            <Dialog>
                                                                <DialogTrigger className="flex flex-1 items-center gap-3 text-left hover:text-primary transition-colors focus:outline-none">
                                                                    <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                                                                    <span className="text-foreground font-medium group-hover/lesson:underline">{lesson.title}</span>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
                                                                    <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
                                                                        <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
                                                                        <div className="text-sm border rounded-full px-2 py-0.5 w-fit text-primary font-medium mt-2 bg-primary/10">Free Preview</div>
                                                                    </DialogHeader>
                                                                    <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
                                                                        {lesson.video_url && (
                                                                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md">
                                                                                <iframe
                                                                                    src={lesson.video_url}
                                                                                    className="w-full h-full border-0"
                                                                                    allowFullScreen
                                                                                    title={lesson.title}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        {lesson.content ? (
                                                                            <div className="prose max-w-none">
                                                                                <RichText content={lesson.content} />
                                                                            </div>
                                                                        ) : (
                                                                            !lesson.video_url && (
                                                                                <div className="text-center py-12 text-muted-foreground border-dashed border-2 rounded-lg">
                                                                                    No content available for this preview.
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ) : (
                                                            <div className="flex flex-1 items-center gap-3">
                                                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                                                                <span className="text-muted-foreground line-clamp-1">{lesson.title}</span>
                                                            </div>
                                                        )}
                                                        {lesson.duration_minutes && (
                                                            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full shrink-0 ml-4">
                                                                {lesson.duration_minutes} min
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

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
