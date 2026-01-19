import { getAdminCourse } from "@/actions/admin/get-admin-courses"
import { CurriculumManager } from "@/components/admin/curriculum-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Settings } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CourseBuilderPage({ params }: { params: { courseId: string } }) {
    const course = await getAdminCourse(params.courseId)

    if (!course) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/training" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
                    </div>
                    <p className="text-muted-foreground ml-6">Manage modules, lessons, and content structure.</p>
                </div>
                <div className="flex items-center gap-2 ml-6 md:ml-0">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/training/${course.id}/edit`}>
                            <Settings className="mr-2 h-4 w-4" /> Settings
                        </Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={`/programs/${course.slug}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" /> Preview
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <CurriculumManager course={course} />
                </div>

                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold mb-4">Course Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`font-medium ${course.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {course.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Modules</span>
                                <span className="font-medium">{course.modules?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Lessons</span>
                                <span className="font-medium">
                                    {course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">{course.duration_hours} Hours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
