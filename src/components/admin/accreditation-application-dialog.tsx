"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, ExternalLink, Check, X, Clock, FileText } from "lucide-react"
import { format } from "date-fns"

interface AccreditationApplicationDialogProps {
    application: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onAction?: (appId: string, status: 'under_review' | 'approved' | 'rejected') => Promise<void>
    isLoading?: boolean
}

export function AccreditationApplicationDialog({
    application,
    open,
    onOpenChange,
    onAction,
    isLoading = false
}: AccreditationApplicationDialogProps) {
    if (!application) return null

    const appData = application.application_data || {}
    const facility = application.facility || {}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-4 pr-6">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {facility.name || "Facility Application"}
                        </DialogTitle>
                        <Badge className={
                            application.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-none' :
                            application.status === 'under_review' ? 'bg-blue-100 text-blue-800 border-none' :
                            application.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-none' :
                            'bg-amber-100 text-amber-800 border-none'
                        }>
                            {application.status?.replace('_', ' ').toUpperCase() || 'SUBMITTED'}
                        </Badge>
                    </div>
                    <DialogDescription>
                        Registration: <strong className="font-mono text-slate-800">{facility.registration_number || 'N/A'}</strong> • Submitted: {application.created_at ? format(new Date(application.created_at), 'PPP') : 'Recently'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-3 text-sm">
                    {/* Facility Summary */}
                    <div className="bg-muted/40 p-3.5 rounded-xl flex flex-wrap gap-x-6 gap-y-2 text-xs border">
                        <div><span className="text-muted-foreground">Type:</span> <strong className="capitalize">{facility.facility_type?.replace('_', ' ') || 'Care Facility'}</strong></div>
                        <div><span className="text-muted-foreground">Location:</span> <strong>{facility.city || ''}{facility.city && facility.state ? ', ' : ''}{facility.state || 'N/A'}</strong></div>
                        <div><span className="text-muted-foreground">Contact:</span> <strong>{facility.email || facility.phone || 'N/A'}</strong></div>
                    </div>

                    {/* Step 1: Governance */}
                    <div className="border rounded-xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">1. Governance & Entity Status</h3>
                            {appData.governance_policy && (
                                <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">Policy Confirmed</Badge>
                            )}
                        </div>
                        <p><span className="text-muted-foreground">Legal Entity Status:</span> <strong>{appData.legal_status || 'Not provided'}</strong></p>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Organizational Structure:</span>
                            {appData.org_structure_link ? (
                                <a href={appData.org_structure_link} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold flex items-center gap-1">
                                    <ExternalLink className="h-3.5 w-3.5" /> View Document
                                </a>
                            ) : (
                                <span className="italic text-slate-600">{appData.org_structure_note || 'Hard copy in office'}</span>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Staffing */}
                    <div className="border rounded-xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">2. Staffing & Competency</h3>
                            {appData.staff_background_check && (
                                <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">Background Checks Verified</Badge>
                            )}
                        </div>
                        <p><span className="text-muted-foreground">Caregiver-to-Patient Ratio:</span> <strong>{appData.staff_ratio || 'Not provided'}</strong></p>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Staff Training Matrix:</span>
                            {appData.training_records_link ? (
                                <a href={appData.training_records_link} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold flex items-center gap-1">
                                    <ExternalLink className="h-3.5 w-3.5" /> View Records
                                </a>
                            ) : (
                                <span className="italic text-slate-600">{appData.training_records_note || 'Hard copy in office'}</span>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Care Practice */}
                    <div className="border rounded-xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">3. Care Practice & Person-Centered Care</h3>
                            {appData.dignity_policy && (
                                <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">Dignity Policy Confirmed</Badge>
                            )}
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs mb-1">Care Planning & Review Process:</span>
                            <p className="bg-white p-3 rounded-lg border text-xs leading-relaxed text-slate-700">
                                {appData.care_plan_process || 'No details provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Step 4: Safety & IPC */}
                    <div className="border rounded-xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">4. Health, Safety & IPC Protocol</h3>
                            {appData.ipc_policy && (
                                <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">IPC Protocols Active</Badge>
                            )}
                        </div>
                        <p><span className="text-muted-foreground">Last Fire Safety Inspection:</span> <strong>{appData.fire_safety_date || 'N/A'}</strong></p>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Risk Assessment Registry:</span>
                            {appData.risk_assessment_link ? (
                                <a href={appData.risk_assessment_link} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold flex items-center gap-1">
                                    <ExternalLink className="h-3.5 w-3.5" /> View Registry
                                </a>
                            ) : (
                                <span className="italic text-slate-600">{appData.risk_assessment_note || 'Hard copy in office'}</span>
                            )}
                        </div>
                    </div>

                    {/* Step 5: Safeguarding */}
                    <div className="border rounded-xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">5. Safeguarding & Protection</h3>
                            {appData.whistleblowing_policy && (
                                <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">Whistleblowing Channel Active</Badge>
                            )}
                        </div>
                        <p><span className="text-muted-foreground">Designated Safeguarding Lead:</span> <strong>{appData.safeguarding_officer || 'Not provided'}</strong></p>
                    </div>

                    {/* Step 6: Documentation */}
                    <div className="border rounded-xl p-4 bg-slate-50/50 space-y-2">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">6. Quality Assurance & Audits</h3>
                        <p><span className="text-muted-foreground">Internal Clinical Audit Frequency:</span> <strong>{appData.audit_frequency || 'Not provided'}</strong></p>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">QA & Compliance Report:</span>
                            {appData.quality_assurance_link ? (
                                <a href={appData.quality_assurance_link} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold flex items-center gap-1">
                                    <ExternalLink className="h-3.5 w-3.5" /> View Report
                                </a>
                            ) : (
                                <span className="italic text-slate-600">{appData.quality_assurance_note || 'Hard copy in office'}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Close
                    </Button>
                    {onAction && (
                        <div className="flex items-center gap-2">
                            {application.status !== 'under_review' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                    onClick={() => onAction(application.id, 'under_review')}
                                    className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs font-semibold"
                                >
                                    <Clock className="h-3.5 w-3.5 mr-1" /> Mark Under Review
                                </Button>
                            )}
                            {application.status !== 'rejected' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                    onClick={() => onAction(application.id, 'rejected')}
                                    className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs font-semibold"
                                >
                                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                                </Button>
                            )}
                            {application.status !== 'approved' && (
                                <Button
                                    size="sm"
                                    disabled={isLoading}
                                    onClick={() => onAction(application.id, 'approved')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                                >
                                    <Check className="h-3.5 w-3.5 mr-1" /> Approve Accreditation
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
