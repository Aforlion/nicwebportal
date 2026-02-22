import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Clock, AlertCircle, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"
import { getStudentAssessmentsData } from "@/actions/student/get-assessments"

export const dynamic = 'force-dynamic'

export default async function ExamsPage() {
    const { assessments, error } = await getStudentAssessmentsData()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Assessments</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Exams & Assessments</h1>
                <p className="text-muted-foreground">Test your knowledge and earn your certifications.</p>
            </div>

            <div className="grid gap-6">
                {assessments && assessments.length > 0 ? (
                    assessments.map((exam: any) => (
                        <Card key={exam.id} className={`${exam.status === 'locked' ? 'opacity-70 bg-muted/20' : ''}`}>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider">{exam.course}</p>
                                        <CardTitle className="text-xl text-secondary">{exam.title}</CardTitle>
                                    </div>
                                    {exam.status === 'completed' ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                            <CheckCircle2 className="mr-1 h-3 w-3" /> COMPLETED
                                        </Badge>
                                    ) : exam.status === 'locked' ? (
                                        <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-none">
                                            <Lock className="mr-1 h-3 w-3" /> LOCKED
                                        </Badge>
                                    ) : exam.status === 'submitted' ? (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                                            <Clock className="mr-1 h-3 w-3" /> SUBMITTED
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                                            <AlertCircle className="mr-1 h-3 w-3" /> AVAILABLE
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <ClipboardCheck className="h-4 w-4" /> {exam.questions} Questions
                                    </span>
                                    {exam.timeLimit && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Clock className="h-4 w-4" /> {exam.timeLimit}
                                        </span>
                                    )}
                                    {exam.score ? (
                                        <span className="flex items-center gap-1.5 font-bold text-secondary">
                                            Grade: <span className="text-emerald-600">{exam.score}</span>
                                        </span>
                                    ) : exam.attempts ? (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            Attempts: {exam.attempts}
                                        </span>
                                    ) : null}
                                    {exam.date && (
                                        <span className="flex items-center gap-1.5 font-medium ml-auto">
                                            Last: {exam.date}
                                        </span>
                                    )}
                                </div>

                                {exam.status === 'locked' && (
                                    <p className="mt-4 text-xs font-medium text-destructive flex items-center gap-1">
                                        <Lock className="h-3 w-3" /> {exam.requirement || "Access restricted"}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="pt-0">
                                {exam.status === 'available' ? (
                                    <Button className="w-full bg-primary" asChild>
                                        <Link href={`/portal/student/exams/${exam.id}`}>Start Assessment</Link>
                                    </Button>
                                ) : exam.status === 'completed' || exam.status === 'submitted' ? (
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/portal/student/exams/${exam.id}/review`}>Review Submission</Link>
                                    </Button>
                                ) : (
                                    <Button variant="secondary" className="w-full" disabled>
                                        Keep Learning to Unlock
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2">
                        <ClipboardCheck className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold text-secondary">No assessments yet</h3>
                        <p>Complete course modules to unlock quizzes and exams.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
