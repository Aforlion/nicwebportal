"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { AccreditationApplicationDialog } from "@/components/admin/accreditation-application-dialog"
import {
    ShieldAlert,
    ShieldCheck,
    Building2,
    BookOpen,
    FileText,
    Calendar,
    ExternalLink,
    Check,
    X,
    Clock,
    AlertCircle,
    UserCheck,
    Eye,
    CheckCircle2,
    Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { updateFacilityCurriculumStatus } from "@/actions/admin/manage-facility-curriculum"
import { updateAccreditationApplicationStatus } from "@/actions/admin/manage-accreditation-applications"
import { verifyDocumentAction } from "@/actions/admin/verify-document"
import { auditInternshipAction } from "@/actions/member/internships"
import { ActionCenterSummary } from "@/actions/admin/get-action-center-items"
import { evaluateFacilityCurriculumAction, CurriculumEvaluationResult } from "@/actions/admin/ai-curriculum-evaluator"
import { AICurriculumEvaluationDialog } from "@/components/admin/ai-curriculum-evaluation-dialog"

interface ActionCenterClientProps {
    initialData: ActionCenterSummary
}

export default function ActionCenterClient({ initialData }: ActionCenterClientProps) {
    const [data, setData] = useState(initialData)
    const [activeTab, setActiveTab] = useState("all")
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

    // Modal state for viewing 6-step accreditation application
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null)

    // AI Curriculum Evaluation Modal state
    const [evaluatingFacilityId, setEvaluatingFacilityId] = useState<string | null>(null)
    const [aiEvaluation, setAiEvaluation] = useState<CurriculumEvaluationResult | null>(null)
    const [selectedFacilityForAI, setSelectedFacilityForAI] = useState<any | null>(null)
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)

    // AI Curriculum Evaluation Handlers
    const handleTriggerAIEvaluation = async (curr: any) => {
        setEvaluatingFacilityId(curr.id)
        try {
            const res = await evaluateFacilityCurriculumAction(curr.id)
            if (res.success && res.evaluation) {
                setAiEvaluation(res.evaluation)
                setSelectedFacilityForAI(curr)
                setIsAIDialogOpen(true)
                toast.success("AI standardization evaluation generated!")
            } else {
                toast.error(res.error || "AI evaluation failed")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to trigger AI audit")
        } finally {
            setEvaluatingFacilityId(null)
        }
    }

    const handleAIDecisionApplied = () => {
        if (selectedFacilityForAI) {
            setData(prev => ({
                ...prev,
                totalPending: Math.max(0, prev.totalPending - 1),
                pendingCurriculums: prev.pendingCurriculums.filter(c => c.id !== selectedFacilityForAI.id)
            }))
        }
    }

    // Handlers
    const handleCurriculumAction = async (facilityId: string, status: 'approved' | 'rejected') => {
        setActionLoadingId(facilityId)
        try {
            const res = await updateFacilityCurriculumStatus(facilityId, status)
            if (res.success) {
                toast.success(`Curriculum ${status} successfully`)
                setData(prev => ({
                    ...prev,
                    totalPending: Math.max(0, prev.totalPending - 1),
                    pendingCurriculums: prev.pendingCurriculums.filter(c => c.id !== facilityId)
                }))
            } else {
                toast.error(res.error || "Failed to update curriculum status")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleAccreditationAction = async (appId: string, status: 'under_review' | 'approved' | 'rejected') => {
        setActionLoadingId(appId)
        try {
            const res = await updateAccreditationApplicationStatus(appId, status)
            if (res.success) {
                toast.success(`Accreditation application status changed to ${status.replace('_', ' ')}`)
                setData(prev => ({
                    ...prev,
                    totalPending: status === 'under_review' ? prev.totalPending : Math.max(0, prev.totalPending - 1),
                    pendingAccreditations: status === 'under_review' 
                        ? prev.pendingAccreditations.map(a => a.id === appId ? { ...a, status: 'under_review' } : a)
                        : prev.pendingAccreditations.filter(a => a.id !== appId)
                }))
                setSelectedApplication(null)
            } else {
                toast.error(res.error || "Failed to update application")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleDocumentAction = async (docId: string, status: 'verified' | 'rejected') => {
        setActionLoadingId(docId)
        try {
            const res = await verifyDocumentAction(docId, status)
            if (res.success) {
                toast.success(`Document marked as ${status}`)
                setData(prev => ({
                    ...prev,
                    totalPending: Math.max(0, prev.totalPending - 1),
                    pendingDocuments: prev.pendingDocuments.filter(d => d.id !== docId)
                }))
            } else {
                toast.error(res.error || "Failed to verify document")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleInternshipAction = async (internshipId: string, status: 'approved' | 'rejected') => {
        setActionLoadingId(internshipId)
        try {
            const res = await auditInternshipAction(internshipId, status)
            if (res.success) {
                toast.success(`Internship ${status} successfully`)
                setData(prev => ({
                    ...prev,
                    totalPending: Math.max(0, prev.totalPending - 1),
                    pendingInternships: prev.pendingInternships.filter(i => i.id !== internshipId)
                }))
            } else {
                toast.error(res.error || "Failed to update internship")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setActionLoadingId(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
                            Administrative Action Center
                        </h1>
                        {data.totalPending > 0 ? (
                            <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1 text-xs">
                                {data.totalPending} Items Requiring Action
                            </Badge>
                        ) : (
                            <Badge className="bg-emerald-500 text-white font-bold px-3 py-1 text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> All Clear
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Unified review queue for institutional accreditation filings, curricula, member compliance documents, and clinical internships.
                    </p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className={`border-l-4 ${data.pendingAccreditations.length > 0 ? 'border-l-rose-500 bg-rose-50/20' : 'border-l-slate-200'}`}>
                    <CardContent className="p-4 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span>Accreditations</span>
                            <Building2 className="h-4 w-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.pendingAccreditations.length}</p>
                        <p className="text-[11px] text-slate-500">Facility 6-pillar submissions</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${data.pendingCurriculums.length > 0 ? 'border-l-indigo-500 bg-indigo-50/20' : 'border-l-slate-200'}`}>
                    <CardContent className="p-4 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span>Curriculums</span>
                            <BookOpen className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.pendingCurriculums.length}</p>
                        <p className="text-[11px] text-slate-500">Training agencies pending review</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${data.pendingDocuments.length > 0 ? 'border-l-amber-500 bg-amber-50/20' : 'border-l-slate-200'}`}>
                    <CardContent className="p-4 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span>Documents</span>
                            <FileText className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.pendingDocuments.length}</p>
                        <p className="text-[11px] text-slate-500">Licenses & compliance proofs</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${data.pendingInternships.length > 0 ? 'border-l-emerald-500 bg-emerald-50/20' : 'border-l-slate-200'}`}>
                    <CardContent className="p-4 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span>Internships</span>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.pendingInternships.length}</p>
                        <p className="text-[11px] text-slate-500">Student completion logs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg text-xs font-bold">
                        All Items ({data.totalPending})
                    </TabsTrigger>
                    <TabsTrigger value="accreditations" className="rounded-lg text-xs font-bold">
                        Accreditations ({data.pendingAccreditations.length})
                    </TabsTrigger>
                    <TabsTrigger value="curriculums" className="rounded-lg text-xs font-bold">
                        Curriculums ({data.pendingCurriculums.length})
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg text-xs font-bold">
                        Documents ({data.pendingDocuments.length})
                    </TabsTrigger>
                    <TabsTrigger value="internships" className="rounded-lg text-xs font-bold">
                        Internships ({data.pendingInternships.length})
                    </TabsTrigger>
                </TabsList>

                {/* TAB: ALL OR SPECIFIC */}
                <div className="space-y-6">
                    {/* 1. Accreditations Section */}
                    {(activeTab === "all" || activeTab === "accreditations") && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-rose-500" /> Facility Accreditation Applications ({data.pendingAccreditations.length})
                            </h2>
                            {data.pendingAccreditations.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border">No pending accreditation applications.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {data.pendingAccreditations.map((app) => (
                                        <Card key={app.id} className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-base text-slate-900">{app.facility?.name || "Care Facility"}</span>
                                                        <Badge variant="outline" className="text-[10px] font-mono">{app.facility?.registration_number || "REG PENDING"}</Badge>
                                                        <Badge className={app.status === 'under_review' ? 'bg-amber-100 text-amber-700 border-none' : 'bg-rose-100 text-rose-700 border-none'}>
                                                            {app.status === 'under_review' ? 'Under Review' : 'New Submission'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Location: {app.facility?.city ? `${app.facility.city}, ` : ''}{app.facility?.state || 'Nigeria'} • Submitted {app.submitted_at ? format(new Date(app.submitted_at), 'PPP') : 'Recently'}
                                                    </p>
                                                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-600">
                                                        <span>Entity Type: <strong>{app.application_data?.legal_status || 'Registered Entity'}</strong></span>
                                                        <span>Staff Ratio: <strong>{app.application_data?.staff_ratio || 'N/A'}</strong></span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-slate-700 border-slate-300"
                                                        onClick={() => setSelectedApplication(app)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5 mr-1" /> View Full Form
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        disabled={actionLoadingId === app.id}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                        onClick={() => handleAccreditationAction(app.id, 'approved')}
                                                    >
                                                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. Curriculums Section */}
                    {(activeTab === "all" || activeTab === "curriculums") && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-indigo-500" /> Training Curricula For Evaluation ({data.pendingCurriculums.length})
                            </h2>
                            {data.pendingCurriculums.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border">No pending training curricula awaiting review.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {data.pendingCurriculums.map((curr) => (
                                        <Card key={curr.id} className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-base text-slate-900">{curr.name}</span>
                                                        <Badge variant="outline" className="text-[10px] font-mono">{curr.registration_number}</Badge>
                                                        <Badge className="bg-amber-100 text-amber-800 border-none text-[10px]">Awaiting Board Approval</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        {curr.city ? `${curr.city}, ` : ''}{curr.state || ''} • Facility Type: {curr.facility_type?.replace('_', ' ')}
                                                    </p>
                                                    <div className="pt-1">
                                                        <a
                                                            href={curr.curriculum_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline gap-1"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            Open Curriculum Document Link
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={evaluatingFacilityId === curr.id || actionLoadingId === curr.id}
                                                        className="border-indigo-300 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 hover:text-indigo-900 font-semibold"
                                                        onClick={() => handleTriggerAIEvaluation(curr)}
                                                    >
                                                        <Sparkles className={`h-3.5 w-3.5 mr-1 text-indigo-600 ${evaluatingFacilityId === curr.id ? 'animate-spin' : 'animate-pulse'}`} />
                                                        {evaluatingFacilityId === curr.id ? "Auditing..." : "AI Standardization Audit"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        disabled={actionLoadingId === curr.id || evaluatingFacilityId === curr.id}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                        onClick={() => handleCurriculumAction(curr.id, 'approved')}
                                                    >
                                                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={actionLoadingId === curr.id || evaluatingFacilityId === curr.id}
                                                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                                                        onClick={() => handleCurriculumAction(curr.id, 'rejected')}
                                                    >
                                                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. Documents Section */}
                    {(activeTab === "all" || activeTab === "documents") && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="h-4 w-4 text-amber-500" /> Compliance Documents Pending Verification ({data.pendingDocuments.length})
                            </h2>
                            {data.pendingDocuments.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border">No pending compliance documents.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {data.pendingDocuments.map((doc) => (
                                        <Card key={doc.id} className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-base text-slate-900">{doc.document_name}</span>
                                                        <Badge variant="secondary" className="text-[10px]">{doc.document_type}</Badge>
                                                        <Badge className="bg-amber-100 text-amber-800 border-none text-[10px]">Pending Verification</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Submitted by: <strong>{doc.membership?.profile?.full_name || 'Member'}</strong> ({doc.membership?.profile?.email}) • {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'PPP') : ''}
                                                    </p>
                                                    {doc.file_url && (
                                                        <div className="pt-1">
                                                            <a
                                                                href={doc.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
                                                            >
                                                                <ExternalLink className="h-3 w-3" /> Preview Document
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        disabled={actionLoadingId === doc.id}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                        onClick={() => handleDocumentAction(doc.id, 'verified')}
                                                    >
                                                        <Check className="h-3.5 w-3.5 mr-1" /> Verify
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={actionLoadingId === doc.id}
                                                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                                                        onClick={() => handleDocumentAction(doc.id, 'rejected')}
                                                    >
                                                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. Internships Section */}
                    {(activeTab === "all" || activeTab === "internships") && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-emerald-500" /> Student Clinical Internships ({data.pendingInternships.length})
                            </h2>
                            {data.pendingInternships.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border">No pending clinical internships.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {data.pendingInternships.map((intern) => (
                                        <Card key={intern.id} className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-base text-slate-900">{intern.profile?.full_name || "Student"}</span>
                                                        <Badge variant="outline" className="text-[10px]">{intern.profile?.email}</Badge>
                                                        <Badge className="bg-amber-100 text-amber-800 border-none text-[10px]">Awaiting Sign-Off</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Facility: <strong>{intern.facility?.name || intern.custom_facility_name || 'Hospital Placement'}</strong>
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Period: {intern.start_date} to {intern.end_date}
                                                    </p>
                                                    {intern.certificate_url && (
                                                        <div className="pt-1">
                                                            <a
                                                                href={intern.certificate_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:underline gap-1"
                                                            >
                                                                <ExternalLink className="h-3 w-3" /> View Completion Certificate
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        disabled={actionLoadingId === intern.id}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                        onClick={() => handleInternshipAction(intern.id, 'approved')}
                                                    >
                                                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={actionLoadingId === intern.id}
                                                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                                                        onClick={() => handleInternshipAction(intern.id, 'rejected')}
                                                    >
                                                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Tabs>

            {/* Modal for 6-step accreditation inspection preview */}
            <AccreditationApplicationDialog
                application={selectedApplication}
                open={!!selectedApplication}
                onOpenChange={(open) => !open && setSelectedApplication(null)}
                onAction={handleAccreditationAction}
                isLoading={actionLoadingId === selectedApplication?.id}
            />

            {/* Modal for AI Curriculum Standardization Evaluation */}
            <AICurriculumEvaluationDialog
                facility={selectedFacilityForAI}
                evaluation={aiEvaluation}
                open={isAIDialogOpen}
                onOpenChange={setIsAIDialogOpen}
                onDecisionApplied={handleAIDecisionApplied}
            />
        </div>
    )
}
