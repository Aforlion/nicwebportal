'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { submitAssessment } from "@/actions/student/take-assessment"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuizPlayerProps {
    courseId: string
    lessonId: string
    assessment: any
    existingSubmission?: {
        status: string
        score: number | null
        feedback?: string
        submitted_at?: string
    } | null
}

export default function QuizPlayer({ courseId, lessonId, assessment, existingSubmission }: QuizPlayerProps) {
    const router = useRouter()
    const [answers, setAnswers] = useState<any>({})
    const [result, setResult] = useState<any>(() => {
        if (!existingSubmission) return null
        const isPassed = existingSubmission.status === 'passed'
        const isPending = existingSubmission.status === 'pending_review'
        return {
            passed: isPassed,
            pending: isPending,
            score: existingSubmission.score,
            feedback: existingSubmission.feedback || (isPassed ? "Great job! You passed." : isPending ? "Submission pending review." : "Score below passing mark. Retake available anytime.")
        }
    })
    const [isLoading, setIsLoading] = useState(false)

    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
        return <div className="p-6 bg-muted rounded-lg text-center">No questions in this quiz.</div>
    }

    const handleOptionChange = (questionId: string, optionId: string) => {
        setAnswers({ ...answers, [questionId]: optionId })
    }

    const handleTextChange = (questionId: string, text: string) => {
        setAnswers({ ...answers, [questionId]: text })
    }

    const handleSubmit = async () => {
        if (Object.keys(answers).length < assessment.questions.length) {
            toast.warning("Please answer all questions before submitting.")
            return
        }

        setIsLoading(true)
        try {
            const res = await submitAssessment(courseId, lessonId, assessment.id, answers)
            if (res.success) {
                setResult(res)
                if (res.passed || res.pending) {
                    if (res.passed) {
                        toast.success("Congratulations! You passed.")
                    } else {
                        toast.success("Submission received. Your assessment is under review.")
                    }
                    router.refresh() // To update progress sidebar
                } else {
                    toast.error("You didn't reach the passing score. You can retake anytime!")
                }
            } else {
                toast.error(res.error || "Submission failed")
            }
        } catch (e) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRetry = () => {
        setResult(null)
        setAnswers({})
    }

    if (result) {
        const isFail = !result.passed && !result.pending;
        return (
            <div className={`border rounded-2xl p-8 text-center space-y-6 animate-in zoom-in-95 shadow-sm ${isFail ? 'bg-red-50/50 border-red-200' : result.passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
                <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${result.passed ? 'bg-emerald-100 text-emerald-600' : result.pending ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                    {result.passed ? <CheckCircle className="h-10 w-10" /> : result.pending ? <Loader2 className="h-10 w-10 animate-spin" /> : <XCircle className="h-10 w-10" />}
                </div>

                <div>
                    <h3 className={`text-2xl font-black ${result.passed ? 'text-emerald-950' : result.pending ? 'text-amber-950' : 'text-red-950'}`}>
                        {result.passed ? "Assessment Passed!" : result.pending ? "Submission Pending Review" : "Assessment Not Passed"}
                    </h3>
                    <p className="text-slate-600 mt-2 max-w-lg mx-auto font-medium">{result.feedback}</p>
                </div>

                {!result.pending && result.score !== null && (
                    <div className="bg-white/80 p-4 rounded-xl max-w-xs mx-auto border shadow-xs">
                        <div className={`text-4xl font-black ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                            {result.score}%
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold mt-1">Passing Threshold: {assessment.passing_score}%</p>
                    </div>
                )}

                {result.passed ? (
                    <div className="space-y-4">
                        <Button onClick={() => router.refresh()} size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md">
                            Continue Learning
                        </Button>
                    </div>
                ) : result.pending ? (
                    <div className="space-y-4">
                        <p className="text-sm bg-amber-100/80 text-amber-900 p-4 rounded-xl border border-amber-200 font-medium">
                            Your assessment has been submitted. Instructors or AI evaluators are reviewing your response. You may proceed with subsequent course lessons!
                        </p>
                        <Button onClick={() => router.refresh()} size="lg" className="w-full font-bold rounded-xl">
                            Continue Learning
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-red-800 bg-red-100/80 p-3.5 rounded-xl border border-red-200 font-medium max-w-md mx-auto">
                            Don't worry! You can retake this assessment as many times as needed to pass. Retaking does not affect your study progress.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={handleRetry} variant="default" size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md px-8">
                                <RefreshCw className="mr-2 h-4 w-4" /> Retake Assessment Now
                            </Button>
                            <Button onClick={() => router.refresh()} variant="outline" size="lg" className="font-bold rounded-xl">
                                Continue Study Path
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto py-8">
            <div className="bg-muted/30 p-6 rounded-lg border">
                <h2 className="text-2xl font-bold mb-2">{assessment.title}</h2>
                <p className="text-muted-foreground">{assessment.description}</p>
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <span>Questions: {assessment.questions.length}</span>
                    <span>Pass Mark: {assessment.passing_score}%</span>
                </div>
            </div>

            <div className="space-y-6">
                {assessment.questions.map((q: any, idx: number) => (
                    <div key={q.id} className="bg-card p-6 rounded-lg border">
                        <h3 className="font-semibold text-lg mb-4">
                            <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                            {q.text}
                        </h3>

                        {q.type === 'essay' ? (
                            <div className="space-y-2">
                                <Label htmlFor={`text-${q.id}`} className="text-sm text-muted-foreground uppercase tracking-wider block">
                                    Your Essay Response
                                </Label>
                                <Textarea
                                    id={`text-${q.id}`}
                                    placeholder="Write your detailed essay here..."
                                    className="min-h-[150px]"
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                                />
                            </div>
                        ) : q.type === 'report' ? (
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground uppercase tracking-wider block">
                                    Upload Project Report
                                </Label>
                                <div className="border rounded-lg p-4 bg-muted/20">
                                    <FileUpload
                                        value={answers[q.id] || ""}
                                        onChange={(url) => handleTextChange(q.id, url)}
                                        bucket="assessment-submissions"
                                        label="Upload Document (PDF, Doc, Zip)"
                                        name={`question_${q.id}`}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Please upload your project report or assignment file. Evaluators will download this file for grading.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <RadioGroup
                                value={answers[q.id]}
                                onValueChange={(val) => handleOptionChange(q.id, val)}
                                className="space-y-3 pl-4"
                            >
                                {q.options.map((opt: any) => (
                                    <div key={opt.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} />
                                        <Label htmlFor={`${q.id}-${opt.id}`} className="font-normal cursor-pointer w-full py-1">
                                            {opt.text}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-6">
                <Button size="lg" onClick={handleSubmit} disabled={isLoading} className="w-full md:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Answers
                </Button>
            </div>
        </div >
    )
}
