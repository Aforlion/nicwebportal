'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"
import { saveAssessment } from "@/actions/admin/manage-assessments"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Question {
    id: string
    text: string
    type: 'multiple_choice' | 'true_false' // Expandable
    options: { id: string, text: string }[]
    correctDetails: { answer: string } // optionId
}

interface QuizBuilderProps {
    lessonId: string
    initialData?: any
}

export default function QuizBuilder({ lessonId, initialData }: QuizBuilderProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [passingScore, setPassingScore] = useState(initialData?.passing_score || 70)

    // Default to one empty question if new, or parse existing
    const [questions, setQuestions] = useState<Question[]>(
        initialData?.questions && Array.isArray(initialData.questions)
            ? initialData.questions
            : []
    )

    const addQuestion = () => {
        const newQ: Question = {
            id: crypto.randomUUID(),
            text: "",
            type: "multiple_choice",
            options: [
                { id: "opt1", text: "" },
                { id: "opt2", text: "" }
            ],
            correctDetails: { answer: "opt1" }
        }
        setQuestions([...questions, newQ])
    }

    const removeQuestion = (idx: number) => {
        const newQ = [...questions]
        newQ.splice(idx, 1)
        setQuestions(newQ)
    }

    const updateQuestion = (idx: number, field: keyof Question, value: any) => {
        const newQ = [...questions]
        // @ts-ignore
        newQ[idx][field] = value
        setQuestions(newQ)
    }

    const updateOption = (qIdx: number, oIdx: number, text: string) => {
        const newQ = [...questions]
        newQ[qIdx].options[oIdx].text = text
        setQuestions(newQ)
    }

    const setCorrectOption = (qIdx: number, optionId: string) => {
        const newQ = [...questions]
        newQ[qIdx].correctDetails.answer = optionId
        setQuestions(newQ)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('passing_score', passingScore.toString())
        formData.append('questions', JSON.stringify(questions))

        const result = await saveAssessment(lessonId, formData)

        if (result.success) {
            toast.success("Quiz saved successfully!")
        } else {
            toast.error(result.error || "Failed to save quiz")
        }
        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg border space-y-4">
                <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
                <div className="grid gap-2">
                    <Label>Quiz Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Module 1 Knowledge Check" required />
                </div>
                <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Instructions for students..." />
                </div>
                <div className="grid gap-2">
                    <Label>Passing Score (%)</Label>
                    <Input type="number" value={passingScore} onChange={e => setPassingScore(parseInt(e.target.value))} max={100} min={1} />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
                    <Button type="button" onClick={addQuestion} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                </div>

                {questions.map((q, qIdx) => (
                    <div key={q.id} className="bg-card p-6 rounded-lg border relative group">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-destructive opacity-50 group-hover:opacity-100"
                            onClick={() => removeQuestion(qIdx)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="grid gap-4">
                            <div className="grid gap-2 pr-10">
                                <Label>Question {qIdx + 1}</Label>
                                <Input
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                                    placeholder="Enter question text..."
                                    required
                                />
                            </div>

                            <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Options</Label>
                                {q.options.map((opt, oIdx) => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCorrectOption(qIdx, opt.id)}
                                            className={`p-1 rounded-full ${q.correctDetails.answer === opt.id ? 'text-green-600 bg-green-100' : 'text-muted-foreground hover:bg-muted'}`}
                                            title="Mark as correct answer"
                                        >
                                            {q.correctDetails.answer === opt.id ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                        </button>
                                        <Input
                                            value={opt.text}
                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                            placeholder={`Option ${oIdx + 1}`}
                                            className="flex-1 h-9"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                        <p className="text-muted-foreground mb-4">No questions yet.</p>
                        <Button type="button" onClick={addQuestion}>Add First Question</Button>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-6 border-t">
                <Button type="submit" size="lg" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Quiz
                </Button>
            </div>
        </form>
    )
}
