'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { submitAssessment } from "@/actions/student/take-assessment"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuizPlayerProps {
    courseId: string
    lessonId: string
    assessment: any
}

export default function QuizPlayer({ courseId, lessonId, assessment }: QuizPlayerProps) {
    const router = useRouter()
    const [answers, setAnswers] = useState<any>({})
    const [result, setResult] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
        return <div className="p-6 bg-muted rounded-lg text-center">No questions in this quiz.</div>
    }

    const handleOptionChange = (questionId: string, optionId: string) => {
        setAnswers({ ...answers, [questionId]: optionId })
    }

    const handleSubmit = async () => {
        // Validation: Check if all questions answered?
        // For now, let's allow partial submission or just check length
        if (Object.keys(answers).length < assessment.questions.length) {
            toast.warning("Please answer all questions before submitting.")
            return
        }

        setIsLoading(true)
        try {
            const res = await submitAssessment(courseId, lessonId, assessment.id, answers)
            if (res.success) {
                setResult(res)
                if (res.passed) {
                    toast.success("Congratulations! You passed.")
                    router.refresh() // To update progress sidebar
                } else {
                    toast.error("You didn't pass. Try again.")
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
        // Optional: shuffle questions
    }

    if (result) {
        return (
            <div className="bg-card border rounded-lg p-8 text-center space-y-6 animate-in zoom-in-95">
                <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {result.passed ? <CheckCircle className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
                </div>

                <div>
                    <h3 className="text-2xl font-bold">{result.passed ? "Quiz Passed!" : "Quiz Failed"}</h3>
                    <p className="text-muted-foreground mt-2">{result.feedback}</p>
                </div>

                <div className="text-4xl font-bold">
                    {result.score}%
                </div>

                <p className="text-sm text-muted-foreground">Passing Score: {assessment.passing_score}%</p>

                {result.passed ? (
                    <Button onClick={() => router.refresh()} size="lg">Continue Learning</Button>
                ) : (
                    <Button onClick={handleRetry} variant="outline" size="lg">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
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
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-6">
                <Button size="lg" onClick={handleSubmit} disabled={isLoading} className="w-full md:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Answers
                </Button>
            </div>
        </div>
    )
}
