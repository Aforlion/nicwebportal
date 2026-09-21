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
import Textarea from "@/components/ui/textarea"
import {
    Sparkles,
    Check,
    X,
    AlertTriangle,
    Clock,
    FileText,
    ExternalLink,
    Send,
    Award,
    Layers,
    BookOpen
} from "lucide-react"
import { toast } from "sonner"
import { CurriculumEvaluationResult, sendCurriculumReviewDecisionAction } from "@/actions/admin/ai-curriculum-evaluator"

interface AICurriculumEvaluationDialogProps {
    facility: any | null
    evaluation: CurriculumEvaluationResult | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onDecisionApplied?: () => void
}

export function AICurriculumEvaluationDialog({
    facility,
    evaluation,
    open,
    onOpenChange,
    onDecisionApplied
}: AICurriculumEvaluationDialogProps) {
    const [submitting, setSubmitting] = useState(false)
    const [customFeedback, setCustomFeedback] = useState(evaluation?.executiveFeedback || "")

    if (!evaluation || !facility) return null

    // Update feedback if evaluation changes
    if (evaluation.executiveFeedback && customFeedback === "" && evaluation.executiveFeedback !== customFeedback) {
        setCustomFeedback(evaluation.executiveFeedback)
    }

    const scorePct = Math.round((evaluation.totalScore / evaluation.maxScore) * 100)

    const handleApplyDecision = async (verdict: 'approved' | 'approved_with_conditions' | 'rejected') => {
        setSubmitting(true)
        try {
            const res = await sendCurriculumReviewDecisionAction(
                facility.id,
                verdict,
                customFeedback || evaluation.executiveFeedback,
                evaluation.pillarScores
            )

            if (res.success) {
                toast.success(`Decision (${verdict.replace(/_/g, ' ')}) applied and formal notification sent!`)
                onOpenChange(false)
                onDecisionApplied?.()
            } else {
                toast.error(res.error || "Failed to submit decision")
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-4 pr-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900">
                                    AI Curriculum Standardization Audit
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Facility: <strong>{facility.name}</strong> • Powered by Google Gemini & SOP-EDU-002
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge className="bg-indigo-600 text-white font-mono text-xs">
                            Gemini 2.5 Flash
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-3 text-sm">
                    {/* Top Score Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                National Caregiver Standardization Score
                            </span>
                            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                                <span className="text-3xl font-extrabold">{evaluation.totalScore}</span>
                                <span className="text-sm text-slate-400 font-semibold">/ {evaluation.maxScore} points ({scorePct}%)</span>
                            </div>
                            <p className="text-xs text-slate-300 max-w-sm pt-1">
                                {evaluation.practicalRatioAssessment}
                            </p>
                        </div>

                        <div className="text-center sm:text-right shrink-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Recommended Regulatory Verdict
                            </span>
                            <Badge className={`text-xs uppercase font-bold px-3 py-1 border-none ${
                                evaluation.recommendedVerdict === 'approved' ? 'bg-emerald-500 text-white' :
                                evaluation.recommendedVerdict === 'approved_with_conditions' ? 'bg-blue-500 text-white' :
                                'bg-amber-500 text-slate-950'
                            }`}>
                                {evaluation.recommendedVerdict.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                    </div>

                    {/* Source Document Attachment */}
                    {facility.curriculum_url && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border text-xs">
                            <div className="flex items-center gap-2 truncate text-slate-700">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">Audited Syllabus Document</span>
                            </div>
                            <a
                                href={facility.curriculum_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary font-bold hover:underline gap-1 shrink-0"
                            >
                                <ExternalLink className="h-3.5 w-3.5" /> Preview Source
                            </a>
                        </div>
                    )}

                    {/* 6 Competency Pillars Grid */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-primary" />
                            Evaluation Across 6 Core NIC Competency Pillars
                        </h3>

                        <div className="grid gap-3">
                            {evaluation.pillarScores.map((pillar, idx) => (
                                <div key={idx} className="p-4 rounded-xl border bg-white space-y-2 hover:border-slate-300 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-600">
                                                {idx + 1}
                                            </span>
                                            {pillar.pillarName}
                                        </span>
                                        <Badge variant="outline" className={`text-xs font-mono font-bold ${
                                            pillar.score === 3 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                            pillar.score === 2 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                            pillar.score === 1 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                            'text-rose-700 bg-rose-50 border-rose-200'
                                        }`}>
                                            {pillar.score} / 3 pts
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        <strong className="text-slate-800">Observed:</strong> {pillar.findings}
                                    </p>

                                    {pillar.gaps && (
                                        <p className="text-xs text-amber-800 bg-amber-50/70 p-2 rounded-md border border-amber-100 leading-relaxed">
                                            <strong className="text-amber-900">Required Improvement:</strong> {pillar.gaps}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Executive Feedback Area */}
                    <div className="space-y-2 pt-2 border-t">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                            <span>Official Feedback to Facility Administrator</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Editable before dispatch</span>
                        </label>
                        <Textarea
                            value={customFeedback || evaluation.executiveFeedback}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomFeedback(e.target.value)}
                            rows={4}
                            className="text-xs leading-relaxed font-sans"
                            placeholder="Constructive feedback to include in official decision notification..."
                        />
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t mt-4">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Close
                    </Button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={submitting}
                            onClick={() => handleApplyDecision('rejected')}
                            className="text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold text-xs"
                        >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Dispatch Revision Notice
                        </Button>

                        {evaluation.recommendedVerdict === 'approved_with_conditions' && (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={submitting}
                                onClick={() => handleApplyDecision('approved_with_conditions')}
                                className="text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold text-xs"
                            >
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Approve with Conditions
                            </Button>
                        )}

                        <Button
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleApplyDecision('approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Confirm Accreditation Approval
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
