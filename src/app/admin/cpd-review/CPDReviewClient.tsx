"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Eye,
    Download,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { updateCPDStatus } from "@/actions/admin/cpd-management"

interface CPDSubmission {
    id: string
    memberName: string
    memberID: string
    activity: string
    provider: string
    points: number
    date: string
    status: string
    certificate: boolean
    certificateUrl?: string
}

interface CPDReviewClientProps {
    initialSubmissions: CPDSubmission[]
    initialStats: {
        pending: number
        approvedThisMonth: number
        rejected: number
    }
}

export default function CPDReviewClient({ initialSubmissions, initialStats }: CPDReviewClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState<string | null>(null)
    const [submissions, setSubmissions] = useState(initialSubmissions)

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        setLoading(id)
        const result = await updateCPDStatus(id, status)
        setLoading(null)

        if (result.success) {
            toast.success(`CPD submission ${status} successfully`)
            // Optimistically update local state
            setSubmissions(prev => prev.map(s =>
                s.id === id ? { ...s, status: status.charAt(0).toUpperCase() + status.slice(1) } : s
            ))
        } else {
            toast.error(result.error || `Failed to ${status} CPD submission`)
        }
    }

    const filteredSubmissions = submissions.filter(s =>
        s.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.memberID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.activity.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">CPD Review</h1>
                    <p className="text-muted-foreground">Review and approve member CPD submissions</p>
                </div>
                <Button className="bg-primary">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                                <p className="text-3xl font-bold text-amber-600">{initialStats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Approved This Month</p>
                                <p className="text-3xl font-bold text-emerald-600">{initialStats.approvedThisMonth}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                                <p className="text-3xl font-bold text-red-600">{initialStats.rejected}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by member name, ID, or activity..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>CPD Submissions</CardTitle>
                    <CardDescription>Review and approve member professional development activities</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredSubmissions.map((submission) => (
                            <div key={submission.id} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-secondary text-base">{submission.memberName}</p>
                                        <p className="text-xs font-mono text-muted-foreground">{submission.memberID}</p>
                                    </div>
                                    <Badge className={
                                        submission.status === "Pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[10px] font-bold" :
                                            submission.status === "Approved" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[10px] font-bold" :
                                                "bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px] font-bold"
                                    }>
                                        {submission.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{submission.activity}</p>
                                    <p className="text-xs text-muted-foreground">{submission.provider} • {submission.date}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t mt-2">
                                    <span className="text-xs font-bold text-primary">{submission.points} CPD Points</span>
                                    <div className="flex gap-2">
                                        {submission.certificateUrl && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" asChild>
                                                <a href={submission.certificateUrl} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {submission.status === "Pending" && (
                                            <>
                                                <Button
                                                    size="icon"
                                                    className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700"
                                                    onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                                    disabled={loading === submission.id}
                                                >
                                                    {loading === submission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-8 w-8"
                                                    onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                                    disabled={loading === submission.id}
                                                >
                                                    {loading === submission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
                                    <th className="px-6 py-4 text-left tracking-wider">Member</th>
                                    <th className="px-6 py-4 text-left tracking-wider">Activity</th>
                                    <th className="px-6 py-4 text-left tracking-wider">Provider</th>
                                    <th className="px-6 py-4 text-center tracking-wider">Points</th>
                                    <th className="px-6 py-4 text-left tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                            No CPD submissions found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubmissions.map((submission) => (
                                        <tr key={submission.id} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-secondary">{submission.memberName}</p>
                                                    <p className="text-xs font-mono text-muted-foreground">{submission.memberID}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-700">{submission.activity}</p>
                                                {submission.certificate && (
                                                    <Badge variant="outline" className="mt-1 text-[10px] font-normal border-slate-200 text-slate-500">Has Certificate</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{submission.provider}</td>
                                            <td className="px-6 py-4 text-center font-bold text-primary">{submission.points}</td>
                                            <td className="px-6 py-4 text-slate-500">{submission.date}</td>
                                            <td className="px-6 py-4">
                                                {submission.status === "Pending" ? (
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        Pending
                                                    </Badge>
                                                ) : submission.status === "Approved" ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Approved
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                        Rejected
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {submission.certificateUrl && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5" asChild>
                                                            <a href={submission.certificateUrl} target="_blank" rel="noopener noreferrer">
                                                                <Eye className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {submission.status === "Pending" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-700 h-8"
                                                                onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                                                disabled={loading === submission.id}
                                                            >
                                                                {loading === submission.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="h-8"
                                                                onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                                                disabled={loading === submission.id}
                                                            >
                                                                {loading === submission.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
