import { getAssessment } from "@/actions/admin/manage-assessments"
import QuizBuilder from "@/components/admin/quiz-builder"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AssessmentPage({ params }: { params: { courseId: string, lessonId: string } }) {
    const assessment = await getAssessment(params.lessonId)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/training/${params.courseId}`}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Curriculum
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Quiz Builder</h1>
                <p className="text-muted-foreground">Create assessment for this lesson.</p>
            </div>

            <QuizBuilder lessonId={params.lessonId} initialData={assessment} />
        </div>
    )
}
