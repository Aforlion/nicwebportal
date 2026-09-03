"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    FilePlus, History, Award, CheckCircle2,
    Search, ExternalLink, Clock, X, Loader2, AlertCircle, Sparkles, ArrowUpRight
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { logCPDActivity } from "@/actions/member/cpd"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CPDActivity {
    id: string
    title: string
    provider: string
    date: string
    type: string
    points: number
    status: string
    certificateUrl: string | null
    description: string
}

interface MemberCPDClientProps {
    activities: CPDActivity[]
    totalPoints: number
    approvedCount: number
    certificateCount: number
    membershipId: string
}

const ACTIVITY_TYPES = ['Training', 'Workshop', 'Seminar', 'Conference', 'Self-Study', 'Online Course', 'Other']

export default function MemberCPDClient({
    activities,
    totalPoints,
    approvedCount,
    certificateCount,
    membershipId,
}: MemberCPDClientProps) {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [showLogModal, setShowLogModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        title: '',
        provider: '',
        activityType: 'Training',
        description: '',
        activityDate: '',
        points: 1,
    })

    const filtered = activities.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.provider.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase())
    )

    const handleSubmit = async () => {
        if (!form.title || !form.activityDate) {
            toast.error("Activity name and date are required.")
            return
        }
        setIsSubmitting(true)
        try {
            const result = await logCPDActivity({
                ...form,
                membershipId,
            })
            if (result.success) {
                toast.success("Activity logged! It will appear as Pending until an admin approves it.")
                setShowLogModal(false)
                setForm({ title: '', provider: '', activityType: 'Training', description: '', activityDate: '', points: 1 })
                router.refresh()
            } else {
                toast.error(result.error || "Failed to log activity.")
            }
        } catch {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const CPD_TARGET = 30

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">CPD Records</h1>
                    <p className="text-muted-foreground">Log and track your Continuing Professional Development (CPD) points.</p>
                </div>
                <Button className="bg-primary" onClick={() => setShowLogModal(true)} disabled={!membershipId}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Log New Activity
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Points</p>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-4xl font-bold text-secondary">{totalPoints}</span>
                            <span className="text-sm font-medium text-muted-foreground mb-1">/ {CPD_TARGET} Required</span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${Math.min((totalPoints / CPD_TARGET) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{Math.min(Math.round((totalPoints / CPD_TARGET) * 100), 100)}% complete</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Approved Logs</p>
                        <div className="flex items-end gap-1 mt-1">
                            <span className="text-4xl font-bold text-secondary">{approvedCount}</span>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">With Certificates</p>
                        <div className="flex items-end gap-1 mt-1">
                            <span className="text-4xl font-bold text-secondary">{certificateCount}</span>
                            <Award className="h-5 w-5 text-accent mb-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Official NIC CPD Micro-Credentials Library Banner */}
            <Card className="border-2 border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white shadow-lg overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> OFFICIAL NIC CPD LIBRARY
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-amber-300">
                            15 Professional CPD Micro-Credentials
                        </h3>
                        <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
                            Access publication-ready curriculum handbooks, complete modules, and earn official CPD points toward your annual membership renewal compliance.
                        </p>
                    </div>

                    <a href="/programs/cpd" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 whitespace-nowrap">
                            <span>Browse 15 CPD Courses</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </a>
                </CardContent>
            </Card>

            {/* No membership warning */}
            {!membershipId && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">You don't have an active membership linked to your account. Contact support to activate your membership before logging CPD activities.</p>
                </div>
            )}

            {/* Activities Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>
                                {activities.length > 0
                                    ? `${activities.length} log${activities.length !== 1 ? 's' : ''} on record`
                                    : "No activities logged yet for this cycle."}
                            </CardDescription>
                        </div>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search logs..."
                                className="pl-10 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">{search ? "No matching activities found." : "No CPD activities logged yet."}</p>
                            {!search && (
                                <p className="text-sm mt-1">Click <strong>Log New Activity</strong> to get started.</p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="py-4 font-medium">Activity</th>
                                        <th className="py-4 font-medium">Date</th>
                                        <th className="py-4 font-medium">Type</th>
                                        <th className="py-4 font-medium text-center">Points</th>
                                        <th className="py-4 font-medium">Status</th>
                                        <th className="py-4 font-medium text-right">Certificate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filtered.map((log) => (
                                        <tr key={log.id} className="group hover:bg-muted/30">
                                            <td className="py-4">
                                                <p className="font-bold text-secondary">{log.title}</p>
                                                {log.provider && <p className="text-xs text-muted-foreground">{log.provider}</p>}
                                            </td>
                                            <td className="py-4 text-muted-foreground">{log.date}</td>
                                            <td className="py-4">
                                                <Badge variant="outline" className="font-normal">{log.type}</Badge>
                                            </td>
                                            <td className="py-4 text-center font-bold text-primary">{log.points}</td>
                                            <td className="py-4">
                                                {log.status === 'Approved' ? (
                                                    <span className="text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Approved
                                                    </span>
                                                ) : log.status === 'Rejected' ? (
                                                    <span className="text-red-500 flex items-center gap-1">
                                                        <X className="h-3 w-3" /> Rejected
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 text-right">
                                                {log.certificateUrl ? (
                                                    <a
                                                        href={log.certificateUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                                                    >
                                                        View <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Log Activity Modal */}
            <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Log CPD Activity</DialogTitle>
                        <p className="text-sm text-muted-foreground">Submitted activities are reviewed and approved by an admin before points are awarded.</p>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="log-title">Activity Name <span className="text-red-500">*</span></Label>
                            <Input id="log-title" placeholder="e.g. Annual Infection Control Update"
                                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="log-provider">Provider / Organiser</Label>
                                <Input id="log-provider" placeholder="e.g. NIC Nigeria"
                                    value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="log-type">Activity Type</Label>
                                <select id="log-type" value={form.activityType}
                                    onChange={e => setForm({ ...form, activityType: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="log-date">Date Completed <span className="text-red-500">*</span></Label>
                                <Input id="log-date" type="date"
                                    value={form.activityDate} onChange={e => setForm({ ...form, activityDate: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="log-points">CPD Points Claimed</Label>
                                <Input id="log-points" type="number" min={1} max={50}
                                    value={form.points} onChange={e => setForm({ ...form, points: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-desc">Description (optional)</Label>
                            <Input id="log-desc" placeholder="Brief description of what you learned"
                                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogModal(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button className="bg-primary" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit for Approval"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
