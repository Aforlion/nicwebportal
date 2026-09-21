"use client"

import { useState, useEffect } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    FileText,
    History,
    Users,
    Activity,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    ExternalLink,
    Loader2,
    Clock,
    BookOpen,
    Check,
    X,
    Sparkles
} from "lucide-react"
import { format } from "date-fns"
import { getFacilityDetails } from "@/actions/admin/get-facility-details"
import { updateFacilityCurriculumStatus } from "@/actions/admin/manage-facility-curriculum"
import { verifyDocumentAction } from "@/actions/admin/verify-document"
import { evaluateFacilityCurriculumAction, CurriculumEvaluationResult } from "@/actions/admin/ai-curriculum-evaluator"
import { AICurriculumEvaluationDialog } from "@/components/admin/ai-curriculum-evaluation-dialog"
import { toast } from "sonner"

interface FacilityDetailsSheetProps {
    facilityId: string | null
    isOpen: boolean
    onClose: () => void
}

export function FacilityDetailsSheet({ facilityId, isOpen, onClose }: FacilityDetailsSheetProps) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        if (isOpen && facilityId) {
            loadDetails()
        } else if (!isOpen) {
            setData(null)
        }
    }, [isOpen, facilityId])

    async function loadDetails() {
        setLoading(true)
        try {
            const result = await getFacilityDetails(facilityId!)
            if (result.error) {
                toast.error(result.error)
                onClose()
            } else {
                setData(result)
            }
        } catch (error) {
            toast.error("Failed to load facility details")
        } finally {
            setLoading(false)
        }
    }

    const [curriculumUpdating, setCurriculumUpdating] = useState(false)
    const [evaluatingAI, setEvaluatingAI] = useState(false)
    const [aiEvaluation, setAiEvaluation] = useState<CurriculumEvaluationResult | null>(null)
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)

    async function handleRunAIEvaluation() {
        if (!facilityId) return
        setEvaluatingAI(true)
        try {
            const res = await evaluateFacilityCurriculumAction(facilityId)
            if (res.success && res.evaluation) {
                setAiEvaluation(res.evaluation)
                setIsAIDialogOpen(true)
                toast.success("AI standardization evaluation generated!")
            } else {
                toast.error(res.error || "AI evaluation failed")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to trigger AI audit")
        } finally {
            setEvaluatingAI(false)
        }
    }

    async function handleCurriculumStatusUpdate(status: 'approved' | 'rejected') {
        if (!facilityId) return
        setCurriculumUpdating(true)
        try {
            const result = await updateFacilityCurriculumStatus(facilityId, status)
            if (result.success) {
                toast.success(`Curriculum ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
                await loadDetails()
            } else {
                toast.error(result.error || "Failed to update curriculum status")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update curriculum")
        } finally {
            setCurriculumUpdating(false)
        }
    }

    const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null)
    async function handleVerifyFacilityDocument(docId: string, status: 'verified' | 'rejected') {
        setVerifyingDocId(docId)
        const result = await verifyDocumentAction(docId, status)
        if (result.success) {
            toast.success(`Document marked as ${status}`)
            await loadDetails()
        } else {
            toast.error(result.error || "Failed to update document")
        }
        setVerifyingDocId(null)
    }

    if (!isOpen) return null

    const facility = data?.facility
    const actions = data?.actions || []
    const documents = data?.documents || []

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none uppercase text-[10px] tracking-wider"><CheckCircle2 className="mr-1 h-3 w-3" /> Fully Compliant</Badge>
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none uppercase text-[10px] tracking-wider"><Clock className="mr-1 h-3 w-3" /> Awaiting Inspection</Badge>
            case 'suspended':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none uppercase text-[10px] tracking-wider"><XCircle className="mr-1 h-3 w-3" /> Suspended</Badge>
            default:
                return <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">{status}</Badge>
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl p-0 flex flex-col gap-0 border-l border-slate-100">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                        <p className="text-sm font-medium">Retrieving facility records...</p>
                    </div>
                ) : facility ? (
                    <>
                        {/* Header Section */}
                        <div className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-start justify-between mb-4 mt-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary">
                                        <Building2 className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-2xl font-bold text-slate-900 font-serif mb-1">
                                            {facility.name}
                                        </SheetTitle>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                {facility.registration_number}
                                            </span>
                                            {getStatusBadge(facility.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Activity className="h-3 w-3" /> Type
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 capitalize">
                                        {facility.facility_type?.replace('_', ' ')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Users className="h-3 w-3" /> Capacity
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {facility.capacity || 'Not Specified'} Beds
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                            <div className="px-6 bg-white border-b border-slate-100 sticky top-0 z-10">
                                <TabsList className="bg-transparent border-none p-0 h-12 gap-6 w-full justify-start">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                        Action Trail
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                        Documents
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1">
                                {/* Overview Tab */}
                                <TabsContent value="overview" className="m-0 p-6 space-y-8">
                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Location Details
                                            </h3>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Address</p>
                                                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                                                        {facility.address}<br />
                                                        {facility.city}, {facility.state}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">Email</p>
                                                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                                            <Mail className="h-3 w-3 text-primary" /> {facility.email}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">Phone</p>
                                                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-primary" /> {facility.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4" /> Inspection Status
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                    <p className="text-xs text-slate-500 mb-1">Last Inspection</p>
                                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-emerald-600" />
                                                        {facility.last_inspection_date ? format(new Date(facility.last_inspection_date), 'MMM d, yyyy') : 'No record'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                    <p className="text-xs text-slate-500 mb-1">Next Due</p>
                                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-amber-600" />
                                                        {facility.next_inspection_date ? format(new Date(facility.next_inspection_date), 'MMM d, yyyy') : 'Not scheduled'}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Institutional Curriculum Review Section */}
                                        {(facility.curriculum_url || facility.facility_type === 'training_agency') && (
                                            <section className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/40 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-indigo-600" /> Institutional Curriculum
                                                    </h3>
                                                    {facility.curriculum_status === 'approved' ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none uppercase text-[10px] tracking-wider">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                                                        </Badge>
                                                    ) : facility.curriculum_status === 'rejected' ? (
                                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none uppercase text-[10px] tracking-wider">
                                                            <XCircle className="mr-1 h-3 w-3" /> Rejected
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none uppercase text-[10px] tracking-wider">
                                                            <Clock className="mr-1 h-3 w-3" /> Under Review
                                                        </Badge>
                                                    )}
                                                </div>

                                                {facility.curriculum_url ? (
                                                    <div className="space-y-3 pt-1">
                                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100">
                                                            <div className="truncate mr-2">
                                                                <p className="text-xs font-semibold text-slate-800">Submitted Curriculum Document</p>
                                                                <p className="text-[11px] text-indigo-600 truncate underline font-mono">
                                                                    {facility.curriculum_url}
                                                                </p>
                                                            </div>
                                                            <Button size="sm" variant="outline" className="shrink-0 text-indigo-600 border-indigo-200 hover:bg-indigo-50" asChild>
                                                                <a href={facility.curriculum_url} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Link
                                                                </a>
                                                            </Button>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            <Button
                                                                size="sm"
                                                                disabled={evaluatingAI}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 font-semibold shadow-sm"
                                                                onClick={handleRunAIEvaluation}
                                                            >
                                                                <Sparkles className={`h-3.5 w-3.5 mr-1 text-indigo-200 ${evaluatingAI ? 'animate-spin' : 'animate-pulse'}`} />
                                                                {evaluatingAI ? "Auditing with AI..." : "Run AI Standardization Audit"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                disabled={curriculumUpdating || evaluatingAI || facility.curriculum_status === 'approved'}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                                                onClick={() => handleCurriculumStatusUpdate('approved')}
                                                            >
                                                                <Check className="h-3.5 w-3.5 mr-1" />
                                                                {curriculumUpdating ? "Updating..." : "Approve Curriculum"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={curriculumUpdating || evaluatingAI || facility.curriculum_status === 'rejected'}
                                                                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8"
                                                                onClick={() => handleCurriculumStatusUpdate('rejected')}
                                                            >
                                                                <X className="h-3.5 w-3.5 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-500 italic">No curriculum document submitted yet.</p>
                                                )}
                                            </section>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* History/Trail Tab */}
                                <TabsContent value="history" className="m-0 p-6">
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                        {actions.length > 0 ? (
                                            actions.map((action: any) => (
                                                <div key={action.id} className="relative">
                                                    <div className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm ${action.action_type === 'approve' ? 'bg-emerald-500' :
                                                            action.action_type === 'suspend' ? 'bg-red-500' :
                                                                action.action_type === 'schedule_inspection' ? 'bg-primary' : 'bg-slate-400'
                                                        }`} />
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold text-slate-800 capitalize">
                                                                {action.action_type.replace('_', ' ')}
                                                            </p>
                                                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">
                                                                {action.created_at ? format(new Date(action.created_at), 'MMM d, h:mm a') : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 leading-relaxed italic">
                                                            "{action.reason || 'No reason provided'}"
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                                            Performed by: <span className="text-slate-600">{action.profiles?.full_name || 'System Admin'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-slate-400">
                                                <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">No action history recorded</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Documents Tab */}
                                <TabsContent value="documents" className="m-0 p-6">
                                    <div className="grid gap-3">
                                        {documents.length > 0 ? (
                                            documents.map((doc: any) => (
                                                <div key={doc.id} className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                                                                <Badge className={
                                                                    doc.status === 'verified' 
                                                                        ? 'bg-emerald-100 text-emerald-800 border-none text-[10px]' 
                                                                        : doc.status === 'rejected'
                                                                        ? 'bg-rose-100 text-rose-800 border-none text-[10px]'
                                                                        : 'bg-amber-100 text-amber-800 border-none text-[10px]'
                                                                }>
                                                                    {doc.status || 'pending'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 uppercase font-medium">{doc.type || 'Institutional Document'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            disabled={verifyingDocId === doc.id || doc.status === 'verified'}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                                            onClick={() => handleVerifyFacilityDocument(doc.id, 'verified')}
                                                        >
                                                            <Check className="h-3 w-3 mr-1" /> Verify
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={verifyingDocId === doc.id || doc.status === 'rejected'}
                                                            className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8"
                                                            onClick={() => handleVerifyFacilityDocument(doc.id, 'rejected')}
                                                        >
                                                            <X className="h-3 w-3 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-slate-400">
                                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">No compliance documents uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </ScrollArea>

                            {/* Sticky Footer */}
                            <div className="p-6 bg-white border-t border-slate-100 mt-auto">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="text-slate-600 font-bold border-slate-200" onClick={onClose}>
                                        Close Details
                                    </Button>
                                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20" asChild>
                                        <a href={`mailto:${facility.email}`}>
                                            Contact Facility
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </Tabs>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                        <p>No facility information found</p>
                    </div>
                )}
            </SheetContent>

            {/* AI Curriculum Standardization Evaluation Dialog */}
            <AICurriculumEvaluationDialog
                facility={facility}
                evaluation={aiEvaluation}
                open={isAIDialogOpen}
                onOpenChange={setIsAIDialogOpen}
                onDecisionApplied={async () => {
                    await loadDetails()
                }}
            />
        </Sheet>
    )
}
