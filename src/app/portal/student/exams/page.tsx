import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Clock, AlertCircle, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"

const exams = [
    {
        id: "ex-01",
        course: "Healthcare Assistant (HCA)",
        title: "Module 2: Anatomy & Physiology Quiz",
        status: "available",
        questions: 20,
        timeLimit: "30 mins",
        attempts: "0/2",
    },
    {
        id: "ex-02",
        course: "Healthcare Assistant (HCA)",
        title: "Module 1: Professional Ethics Exam",
        status: "completed",
        questions: 15,
        score: "92%",
        date: "Jan 10, 2026",
    },
    {
        id: "ex-03",
        course: "Dementia Care Specialist",
        title: "Final Certification Exam",
        status: "locked",
        questions: 50,
        timeLimit: "90 mins",
        requirement: "Requires Module 4 completion",
    }
]

export default function ExamsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Exams & Assessments</h1>
                <p className="text-muted-foreground">Test your knowledge and earn your certifications.</p>
            </div>

            <div className="grid gap-6">
                {exams.map((exam) => (
                    <Card key={exam.id} className={`${exam.status === 'locked' ? 'opacity-70 bg-muted/20' : ''}`}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{exam.course}</p>
                                    <CardTitle className="text-xl text-secondary">{exam.title}</CardTitle>
                                </div>
                                {exam.status === 'completed' ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> COMPLETED
                                    </Badge>
                                ) : exam.status === 'locked' ? (
                                    <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                        <Lock className="mr-1 h-3 w-3" /> LOCKED
                                    </Badge>
                                ) : (
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
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
                            </div>

                            {exam.status === 'locked' && (
                                <p className="mt-4 text-xs font-medium text-destructive flex items-center gap-1">
                                    <Lock className="h-3 w-3" /> {exam.requirement}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0">
                            {exam.status === 'available' ? (
                                <Button className="w-full bg-primary" asChild>
                                    <Link href={`/portal/student/exams/${exam.id}`}>Start Assessment</Link>
                                </Button>
                            ) : exam.status === 'completed' ? (
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/portal/student/exams/${exam.id}/review`}>Review Answers</Link>
                                </Button>
                            ) : (
                                <Button variant="secondary" className="w-full" disabled>
                                    Keep Learning to Unlock
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
