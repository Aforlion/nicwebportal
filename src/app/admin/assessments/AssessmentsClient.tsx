'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    CheckCircle2,
    Clock,
    FileText,
    Eye,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft
} from "lucide-react"
import { getSubmissions, gradeSubmission } from "@/actions/admin/manage-assessments"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Textarea from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface Submission {
    id: string
    assessment_id: string
    enrollment_id: string
    score: number | null
    status: 'submitted' | 'graded' | 'pending_review' | 'failed' | 'passed'
    submission_data: any
    submitted_at: string
    graded_at: string | null
    feedback: string | null
    assessment: {
        title: string
        lessons: {
            modules: {
                courses: {
                    title: string
                }
            }
        }
    }
    enrollment: {
        profiles: {
            full_name: string
            avatar_url: string | null
        }
    }
}

export default function AssessmentsClient({ initialSubmissions }: { initialSubmissions: any }) {
    const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [loading, setLoading] = useState(false)
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [gradingScore, setGradingScore] = useState("")
    const [gradingFeedback, setGradingFeedback] = useState("")
    const [isGrading, setIsGrading] = useState(false)

    const fetchSubmissions = async () => {
        setLoading(true)
        const res = await getSubmissions(statusFilter === 'all' ? undefined : statusFilter)
        if (res.submissions) {
            setSubmissions(res.submissions)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSubmissions()
    }, [statusFilter])

    const filteredSubmissions = submissions.filter(s =>
        s.enrollment.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assessment.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleGrade = async () => {
        if (!selectedSubmission) return
        if (!gradingScore || isNaN(parseInt(gradingScore))) {
            toast.error("Please enter a valid numeric score")
            return
        }

        setIsGrading(true)
        const res = await gradeSubmission(selectedSubmission.id, parseInt(gradingScore), gradingFeedback)

        if (res.success) {
            toast.success("Submission graded successfully")
            setSelectedSubmission(null)
            setGradingScore("")
            setGradingFeedback("")
            fetchSubmissions()
        } else {
            toast.error(res.error || "Failed to grade submission")
        }
        setIsGrading(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'passed':
            case 'graded':
                return <Badge className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Graded / Passed</Badge>
            case 'failed':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>
            case 'pending_review':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Student Assessments</h1>
                    <p className="text-muted-foreground">Review and grade submissions for essays, reports, and quizzes.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/training">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[300px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student or assessment title..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <select
                            className="flex h-10 w-full md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="graded">Graded / Passed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Assessment</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Score</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                                    <th className="text-right p-4 font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                                            Loading submissions...
                                        </td>
                                    </tr>
                                ) : filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            No submissions found.
                                        </td>
                                    </tr>
                                ) : filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                                                    {sub.enrollment.profiles.full_name?.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-medium">{sub.enrollment.profiles.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                    {/* @ts-ignore - Handle possible array/object nesting from Supabase joins */}
                                                    {(sub.assessment.lessons?.modules?.courses?.title || sub.assessment.lessons?.[0]?.modules?.courses?.title || "Unknown Course")}
                                                </span>
                                                <span className="font-medium">{sub.assessment.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{getStatusBadge(sub.status)}</td>
                                        <td className="p-4 font-mono">
                                            {sub.score !== null ? `${sub.score}%` : '---'}
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">
                                            {new Date(sub.submitted_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedSubmission(sub)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View / Grade
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Grading Dialog */}
            <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
                <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Submission Review</DialogTitle>
                        <DialogDescription>
                            Review student answers and provide grade/feedback.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Student</span>
                                    <span className="font-semibold">{selectedSubmission.enrollment.profiles.full_name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Assessment</span>
                                    <span className="font-semibold">{selectedSubmission.assessment.title}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Student Answers
                                </h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 border rounded-md p-4 bg-background">
                                    {Object.entries(selectedSubmission.submission_data || {}).map(([qId, answer]: [string, any], idx) => (
                                        <div key={qId} className="border-b last:border-0 pb-4 last:pb-0">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Question {idx + 1}</p>
                                            <div className="prose prose-sm max-w-none bg-slate-50 p-3 rounded border">
                                                {typeof answer === 'string' ? answer : JSON.stringify(answer)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 pt-4 border-t">
                                <div className="grid gap-2">
                                    <Label>Score (0-100)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 85"
                                        value={gradingScore}
                                        onChange={e => setGradingScore(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Feedback</Label>
                                    <Textarea
                                        placeholder="Excellent work! Your report was very detailed..."
                                        value={gradingFeedback}
                                        onChange={e => setGradingFeedback(e.target.value)}
                                        className="h-24"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-6 border-t">
                        <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
                        <Button onClick={handleGrade} disabled={isGrading}>
                            {isGrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Grade & Notify Student
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
