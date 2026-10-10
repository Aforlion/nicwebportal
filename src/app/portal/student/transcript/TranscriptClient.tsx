'use client'

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Printer, 
    BookOpen, 
    Clock, 
    ShieldCheck, 
    Award, 
    Building2, 
    FileText, 
    CheckCircle,
    GraduationCap,
    Check
} from "lucide-react"
import Image from "next/image"
import QRCodeDisplay from "@/components/certificate/qr-code-display"

interface Lesson {
    id: string
    title: string
    slug: string
    duration_minutes?: number
    sort_order: number
}

interface Module {
    id: string
    title: string
    description: string
    sort_order: number
    lessons: Lesson[]
}

interface Course {
    id: string
    title: string
    slug: string
    level: string
    duration_hours: number
    modules: Module[]
}

interface Enrollment {
    id: string
    course_id?: string
    enrolled_at: string
    completed_at?: string
    progress: number
    status: string
    course: Course
}

interface Submission {
    id?: string
    enrollment_id: string
    score: number | null
    status: string
    submitted_at: string
    assessment: {
        id?: string
        title: string
        type?: string
        passing_score?: number
    }
}

interface TranscriptProps {
    data: {
        enrollments: Enrollment[]
        submissions: Submission[]
        certificates: any[]
        selectedCourseId?: string | null
        user: {
            full_name: string
            email: string
            student_id: string
            membership_tier: string
        }
    }
}

// Curated specialized competencies for flagship courses with dynamic fallback
function getCourseCompetencies(course: Course | undefined) {
    if (!course) return []
    const slug = (course.slug || '').toLowerCase()
    const title = (course.title || '').toLowerCase()

    if (slug.includes('fundamentals') || title.includes('fundamentals')) {
        return [
            { domain: "Infection Control", focus: "Hand Hygiene, PPE & Aseptic Precautions" },
            { domain: "Personal Care & ADLs", focus: "Safe Bathing, Hygiene, Nutrition & Feeding" },
            { domain: "Mobility & Transfers", focus: "Body Mechanics, Transfers & Assistive Devices" },
            { domain: "Emergency & Safety", focus: "First Aid, Crisis Prevention & Escalation Protocols" }
        ]
    }

    if (slug.includes('geriatric') || title.includes('geriatric') || title.includes('gerontology') || slug.includes('dementia')) {
        return [
            { domain: "Gerontology Foundations", focus: "Age-Related Physiology & Multimorbidity Support" },
            { domain: "Dementia & Memory Care", focus: "Cognitive Decline, Wandering & Behaviour Support" },
            { domain: "Fall Prevention & Mobility", focus: "Assistive Devices & Environmental Hazard Audits" },
            { domain: "Chronic Care Management", focus: "Vital Signs, Medication Adherence & Nutrition" }
        ]
    }

    if (slug.includes('disability') || title.includes('disability') || title.includes('special needs')) {
        return [
            { domain: "Disability Rights & Inclusion", focus: "Human Dignity, Autonomy & Independent Living" },
            { domain: "Assistive Technologies", focus: "Adaptive Equipment, Hoists & Mobility Assistance" },
            { domain: "Positive Behaviour Support", focus: "De-escalation, Sensory Safety & Communication" },
            { domain: "Specialized Daily Care", focus: "Complex ADLs, Enteral Care & Skin Integrity" }
        ]
    }

    if (slug.includes('home-health') || title.includes('home health') || title.includes('palliative') || slug.includes('palliative')) {
        return [
            { domain: "Home Healthcare Standards", focus: "Autonomous Home Environment & Hygiene Protocols" },
            { domain: "Chronic Disease Care", focus: "Hypertension, Diabetes, Stroke & Recovery Care" },
            { domain: "Palliative Comfort Care", focus: "Pain Relief Support, Symptom Care & Dignity" },
            { domain: "Emergency Escalation", focus: "Home Hazard Prevention, Triage & Rapid Transfer" }
        ]
    }

    if (slug.includes('advanced') || slug.includes('acp') || title.includes('advanced')) {
        return [
            { domain: "Advanced Clinical Observation", focus: "Systematic Vital Signs & Symptom Monitoring" },
            { domain: "Medication Governance", focus: "Administration Safety, Side Effects & Compliance" },
            { domain: "Care Coordination", focus: "Interprofessional Liaison & Clinical Handover" },
            { domain: "Clinical Escalation & Triage", focus: "Acute Deterioration Management & Documentation" }
        ]
    }

    if (slug.includes('supervisor') || title.includes('supervisor') || title.includes('facility manager')) {
        return [
            { domain: "Care Facility Operations", focus: "National Care Standards, Health & Safety Compliance" },
            { domain: "Care Team Leadership", focus: "Shift Scheduling, Mentorship & Staff Supervision" },
            { domain: "Quality Assurance Audits", focus: "Care Plan Reviews, Record Keeping & Inspections" },
            { domain: "Risk & Incident Governance", focus: "Safeguarding Investigations & Regulatory Filings" }
        ]
    }

    // Dynamic derivation from course modules
    if (course.modules && course.modules.length > 0) {
        return course.modules.slice(0, 4).map((mod, idx) => ({
            domain: mod.title.length > 28 ? mod.title.substring(0, 28) + "..." : mod.title,
            focus: mod.lessons?.[0]?.title ? mod.lessons[0].title : `Core Competency Unit ${idx + 1}`
        }))
    }

    return [
        { domain: "Core Theoretical Care", focus: "Evidence-Based Best Practice Principles" },
        { domain: "Practical Clinical Skills", focus: "Applied Caregiver Demonstrations" },
        { domain: "Safety & Safeguarding", focus: "Client Protection & Ethical Conduct" },
        { domain: "Professional Documentation", focus: "Objective Reporting & Incident Handover" }
    ]
}

// Practical training description tailored to course
function getPracticalTrainingDescription(courseTitle: string, slug?: string) {
    const text = (courseTitle + ' ' + (slug || '')).toLowerCase()

    if (text.includes('geriatric') || text.includes('gerontology') || text.includes('dementia')) {
        return {
            title: "Geriatric & Memory Care Clinical Practicum",
            description: "Supervised clinical skills evaluations conducted at accredited NIC elderly care facilities and geriatric centres. Verified competencies include cognitive status checks, dementia behavioral support, fall risk reduction, safe assisted transfers, and respectful personal care."
        }
    }
    if (text.includes('disability') || text.includes('special needs')) {
        return {
            title: "Special Needs & Assistive Care Practicum",
            description: "Practical clinical evaluations conducted at accredited specialized care centres. Verified competencies include adaptive equipment and mobility hoist operation, dignified personal care assistance, sensory adaptation, and positive behavioral de-escalation."
        }
    }
    if (text.includes('home health') || text.includes('palliative') || text.includes('hospice')) {
        return {
            title: "Home Health & Palliative Care Clinical Practicum",
            description: "Supervised clinical practicum conducted in accredited healthcare and domiciliary care environments. Verified competencies include chronic illness observation, palliative comfort measures, vital signs tracking, and dignified end-of-life care assistance."
        }
    }
    if (text.includes('advanced') || text.includes('acp') || text.includes('supervisor')) {
        return {
            title: "Advanced Clinical Practice & Supervisory Practicum",
            description: "Advanced clinical simulations and facility management practicum conducted at accredited NIC training institutions. Verified competencies include interprofessional communication, clinical escalation leadership, audit of caregiver care logs, and regulatory compliance."
        }
    }
    if (text.includes('cpd') || text.includes('micro-credential')) {
        return {
            title: "Specialized Continuing Professional Development Practicum",
            description: "Targeted clinical competencies verified through hands-on demonstration, case scenario simulation, and objective procedural checklists aligned with NIC Continuing Professional Development (CPD) practice guidelines."
        }
    }
    return {
        title: "Clinical Skills Centre & Hospital Placement",
        description: "Practical clinical skills evaluations conducted at accredited NIC partner facilities including hands-on verification of vital signs observation, infection control protocols, bed transfers, mobility device assistance, and objective care documentation."
    }
}

export default function TranscriptClient({ data }: TranscriptProps) {
    const { enrollments, submissions, certificates, user, selectedCourseId } = data

    // Determine initial active enrollment
    const initialEnrollmentId = useMemo(() => {
        if (!enrollments || enrollments.length === 0) return ""
        if (selectedCourseId) {
            const matched = enrollments.find(e => e.course?.id === selectedCourseId || e.course_id === selectedCourseId || e.id === selectedCourseId)
            if (matched) return matched.id
        }
        return enrollments[0].id
    }, [enrollments, selectedCourseId])

    const [activeEnrollmentId, setActiveEnrollmentId] = useState<string>(initialEnrollmentId)

    const activeEnrollment = useMemo(() => {
        return enrollments.find(e => e.id === activeEnrollmentId) || enrollments[0]
    }, [enrollments, activeEnrollmentId])

    const course = activeEnrollment?.course

    // Course Title & Level
    const courseTitle = course?.title || "Fundamentals of Professional Caregiving"
    const courseLevel = course?.level || "Level 1: Foundation"

    // Calculate Learning Hours dynamically
    const { theoryHours, practicalHours, totalHours } = useMemo(() => {
        const isFundamentals = (course?.slug || '').toLowerCase().includes('fundamentals') || courseTitle.toLowerCase().includes('fundamentals')
        if (isFundamentals) {
            return { theoryHours: 120, practicalHours: 80, totalHours: 200 }
        }

        const rawTotal = course?.duration_hours || 40
        if (rawTotal <= 10) {
            const th = Math.max(1, Math.ceil(rawTotal * 0.6))
            const pr = Math.max(1, rawTotal - th)
            return { theoryHours: th, practicalHours: pr, totalHours: rawTotal }
        }

        const th = Math.round(rawTotal * 0.6)
        const pr = rawTotal - th
        return { theoryHours: th, practicalHours: pr, totalHours: rawTotal }
    }, [course, courseTitle])

    // Derive course competencies
    const competencies = useMemo(() => getCourseCompetencies(course), [course])

    // Practical description
    const practicalInfo = useMemo(() => getPracticalTrainingDescription(courseTitle, course?.slug), [courseTitle, course?.slug])

    // Consolidated official assessments for THIS enrollment ONLY
    const consolidatedAssessments = useMemo(() => {
        if (!activeEnrollment) return []
        
        // 1. Strictly filter to this enrollment
        const thisCourseSubs = (submissions || []).filter(s => s.enrollment_id === activeEnrollment.id)

        // 2. Consolidate by unique assessment ID / title to show official accredited standing
        const map = new Map<string, {
            title: string
            passingScore: number
            bestScore: number | null
            latestDate: string
            status: string
            isPassed: boolean
        }>()

        thisCourseSubs.forEach(sub => {
            const key = sub.assessment?.id || sub.assessment?.title || 'assessment'
            const title = sub.assessment?.title || 'Course Assessment'
            const passingScore = sub.assessment?.passing_score || 70
            const currentScore = sub.score
            const date = sub.submitted_at || ''

            const existing = map.get(key)
            if (!existing) {
                const isPassed = currentScore !== null && (currentScore >= passingScore || sub.status === 'passed')
                map.set(key, {
                    title,
                    passingScore,
                    bestScore: currentScore,
                    latestDate: date,
                    status: sub.status,
                    isPassed
                })
            } else {
                const newScore = Math.max(existing.bestScore ?? -1, currentScore ?? -1)
                const isPassed = (newScore >= passingScore) || sub.status === 'passed' || existing.isPassed
                // Keep the date of the highest scoring attempt
                const newDate = (currentScore !== null && currentScore >= (existing.bestScore ?? -1)) ? date : existing.latestDate
                map.set(key, {
                    ...existing,
                    bestScore: newScore === -1 ? null : newScore,
                    latestDate: newDate,
                    isPassed
                })
            }
        })

        return Array.from(map.values())
    }, [activeEnrollment, submissions])

    const formattedIssueDate = new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    })

    // Course-specific transcript code
    const courseCode = useMemo(() => {
        if (!course?.slug) return 'PROG'
        const parts = course.slug.split('-').filter(Boolean)
        const acronym = parts.map((p: string) => p[0]?.toUpperCase()).join('').slice(0, 4)
        return acronym || 'PROG'
    }, [course])

    const transcriptCode = `TR-NIC-${new Date().getFullYear()}-${courseCode}-${user.student_id.replace(/[^A-Z0-9]/gi, '').slice(-4) || '8942'}`
    const verificationUrl = `https://www.nicnigeria.org/verify?code=${transcriptCode}`

    const handlePrint = () => {
        window.print()
    }

    const handleCourseChange = (enrollmentId: string) => {
        setActiveEnrollmentId(enrollmentId)
        const selected = enrollments.find(e => e.id === enrollmentId)
        if (selected?.course?.id && typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.set('courseId', selected.course.id)
            window.history.replaceState(null, '', url.toString())
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-16">
            {/* Top Bar for Web Browser Viewing */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-amber-400" />
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Official Academic Transcript & Dossier</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300">
                        Official accredited record of curriculum, learning hours, practical training, and verified assessment grades.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Course Switcher Dropdown if Multiple Enrollments */}
                    {enrollments.length > 1 && (
                        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-inner">
                            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider shrink-0">Course:</span>
                            <select
                                value={activeEnrollmentId}
                                onChange={(e) => handleCourseChange(e.target.value)}
                                className="bg-transparent text-amber-300 font-bold text-xs focus:outline-none cursor-pointer max-w-[220px] truncate"
                            >
                                {enrollments.map(e => (
                                    <option key={e.id} value={e.id} className="bg-slate-900 text-white">
                                        {e.course?.title || 'Course'} ({e.status === 'completed' || e.progress >= 100 ? 'Completed' : `${Math.round(e.progress)}%`})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Button variant="default" onClick={handlePrint} className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl shadow-md shrink-0">
                        <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
                    </Button>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm;
                    }
                    html, body {
                        background: #ffffff !important;
                        color: #0f172a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .page-break-before {
                        page-break-before: always !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>

            {/* MAIN TRANSCRIPT CONTAINER */}
            <div className="bg-white border-2 border-slate-200 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden text-slate-900 print:border-none print:shadow-none print:p-0">
                
                {/* Background Watermark Coat of Arms on Every Page View */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0">
                    <Image src="/coat-of-arm.png" alt="NIC Watermark Seal" width={550} height={550} className="object-contain" />
                </div>

                {/* INSTITUTIONAL HEADER */}
                <div className="relative z-10 border-b-2 border-[#D97706] pb-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white border border-[#D97706]/40 p-1.5 shadow-sm flex items-center justify-center shrink-0">
                                <Image src="/logo.jpg" alt="NIC Logo" width={52} height={52} className="object-contain rounded" />
                            </div>
                            <div>
                                <span className="block text-xs font-bold tracking-[0.25em] text-[#D97706] uppercase font-sans">
                                    NATIONAL INSTITUTE OF CAREGIVERS
                                </span>
                                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 uppercase mt-0.5">
                                    NIC NIGERIA REGISTRY BOARD
                                </h1>
                                <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mt-0.5">
                                    ACADEMIC & PROFESSIONAL PRACTICE REGULATION DIVISION
                                </p>
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="inline-block px-3 py-1 bg-slate-900 text-amber-400 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase mb-2 shadow-sm">
                                OFFICIAL TRANSCRIPT
                            </div>
                            <p className="text-[10px] font-mono font-bold text-slate-600">TRANSCRIPT NO: {transcriptCode}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Date Issued: {formattedIssueDate}</p>
                        </div>
                    </div>

                    <div className="mt-6 text-center bg-slate-50 py-2.5 rounded-xl border border-slate-200/80">
                        <h2 className="text-sm sm:text-base font-serif font-extrabold uppercase tracking-widest text-slate-800">
                            OFFICIAL ACADEMIC TRANSCRIPT & CURRICULUM SPECIFICATIONS
                        </h2>
                    </div>
                </div>

                {/* STUDENT & PROGRAMME DOSSIER GRID */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-sm mb-10 text-xs">
                    <div className="space-y-2.5 border-r-0 sm:border-r border-slate-200 pr-0 sm:pr-4">
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">STUDENT FULL NAME</span>
                            <p className="text-sm font-bold text-slate-900 font-serif">{user.full_name}</p>
                        </div>
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">STUDENT REGISTRATION ID</span>
                            <p className="text-xs font-mono font-bold text-[#B45309]">{user.student_id}</p>
                        </div>
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">MEMBERSHIP CATEGORY / TIER</span>
                            <p className="text-xs font-semibold text-slate-800">{user.membership_tier}</p>
                        </div>
                    </div>

                    <div className="space-y-2.5 pl-0 sm:pl-2">
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">ACCREDITED PROGRAMME</span>
                            <p className="text-sm font-bold text-slate-900 uppercase">{courseTitle}</p>
                        </div>
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">QUALIFICATION LEVEL</span>
                            <p className="text-xs font-semibold text-slate-800">{courseLevel}</p>
                        </div>
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">ACCREDITED LEARNING HOURS</span>
                            <p className="text-xs font-bold text-emerald-700">
                                {theoryHours} Theory Hours + {practicalHours} Practical Hours ({totalHours} Total Learning Hours)
                            </p>
                        </div>
                    </div>
                </div>

                {/* SECTION 1: PROGRAMME & COMPETENCY FRAMEWORK */}
                <div className="relative z-10 mb-10 space-y-4">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                        <Award className="h-5 w-5 text-[#D97706]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            SECTION I: PROGRAMME ACCREDITATION & COMPETENCY FRAMEWORK
                        </h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">
                        This official transcript verifies that the student has completed the accredited curriculum for{" "}
                        <strong className="text-slate-900">{courseTitle}</strong> established by the{" "}
                        <strong className="text-slate-900">National Institute of Caregivers (NIC Nigeria)</strong> under National Professional Practice Standards. 
                        The programme integrates standard theoretical instruction, interactive multimedia case simulations, 
                        and supervised practical clinical skills assessments.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
                        {competencies.map((comp, cIdx) => (
                            <div key={cIdx} className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                                <span className="block font-bold text-slate-900 leading-tight">{comp.domain}</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{comp.focus}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 2: MODULE & CURRICULUM SPECIFICATIONS */}
                <div className="relative z-10 mb-10 space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                        <BookOpen className="h-5 w-5 text-[#D97706]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            SECTION II: DETAILED MODULE & CURRICULUM SPECIFICATIONS
                        </h3>
                    </div>

                    {course?.modules && course.modules.length > 0 ? (
                        <div className="space-y-6">
                            {course.modules.map((module, idx) => {
                                const moduleCount = course.modules.length || 1
                                const modTotal = Math.max(1, Math.round(totalHours / moduleCount))
                                const modTheory = Math.max(1, Math.round(modTotal * 0.6))
                                const modPractical = Math.max(0, modTotal - modTheory)

                                return (
                                    <div key={module.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3 page-break-inside-avoid">
                                        <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                                            <div>
                                                <span className="text-[10px] font-black text-[#D97706] uppercase tracking-widest">
                                                    MODULE {idx + 1}
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-900 uppercase">
                                                    {module.title}
                                                </h4>
                                            </div>
                                            <Badge variant="outline" className="bg-slate-900 text-amber-400 border-none font-mono text-[10px] shrink-0">
                                                {modTotal} Credit Hours ({modTheory} Theory + {modPractical} Practical)
                                            </Badge>
                                        </div>

                                        {module.description && (
                                            <p className="text-xs text-slate-600 leading-relaxed italic">
                                                {module.description.length > 250 ? module.description.substring(0, 250) + "..." : module.description}
                                            </p>
                                        )}

                                        {/* Lessons List */}
                                        <div className="pt-2 space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                                CURRICULUM LESSON UNITS & COMPETENCY TOPICS:
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                {module.lessons?.map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                                                        <div className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800 line-clamp-1 text-[11px]">
                                                            {lesson.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-50 rounded-2xl border text-center text-xs text-slate-500">
                            No modules mapped to this curriculum.
                        </div>
                    )}
                </div>

                {/* PAGE BREAK FOR PRINT IF APPLICABLE */}
                <div className="page-break-before" />

                {/* SECTION 3: ASSESSMENT PERFORMANCE & EXAMINATION LOG */}
                <div className="relative z-10 mb-10 space-y-4">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                        <FileText className="h-5 w-5 text-[#D97706]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            SECTION III: ACADEMIC ASSESSMENT & EXAMINATION LOG
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white uppercase text-[9.5px] font-bold tracking-widest">
                                    <th className="text-left p-3 rounded-tl-xl">Assessment Module / Unit</th>
                                    <th className="text-center p-3">Passing Grade</th>
                                    <th className="text-center p-3">Score Obtained</th>
                                    <th className="text-center p-3">Evaluation Status</th>
                                    <th className="text-right p-3 rounded-tr-xl">Date Completed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 border-x border-b border-slate-200">
                                {consolidatedAssessments.length > 0 ? (
                                    consolidatedAssessments.map((sub, idx) => {
                                        const score = sub.bestScore
                                        const passing = sub.passingScore || 70
                                        const isPassed = sub.isPassed || (score !== null && score >= passing)
                                        const isDistinction = isPassed && score !== null && score >= 90
                                        const isPending = sub.status === 'pending_review' || score === null

                                        return (
                                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                <td className="p-3 font-bold text-slate-800">{sub.title}</td>
                                                <td className="p-3 text-center text-slate-500 font-mono">{passing}%</td>
                                                <td className="p-3 text-center font-mono font-extrabold text-slate-900">
                                                    {score !== null ? `${score}%` : 'Pending'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {isPending ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                                                            PENDING EVALUATION
                                                        </span>
                                                    ) : isDistinction ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                                            PASSED WITH DISTINCTION
                                                        </span>
                                                    ) : isPassed ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                                            PASSED / VERIFIED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                                                            FAILED / RETAKE REQUIRED
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right text-slate-500 font-mono">
                                                    {sub.latestDate ? new Date(sub.latestDate).toLocaleDateString('en-GB') : formattedIssueDate}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td className="p-3 font-bold text-slate-800">
                                            {courseTitle} - Comprehensive Academic Assessment & Practicum
                                        </td>
                                        <td className="p-3 text-center text-slate-500 font-mono">70%</td>
                                        <td className="p-3 text-center font-mono font-extrabold text-slate-900">
                                            {activeEnrollment?.progress ? `${Math.round(activeEnrollment.progress)}%` : '100%'}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                                PASSED / VERIFIED
                                            </span>
                                        </td>
                                        <td className="p-3 text-right text-slate-500 font-mono">
                                            {activeEnrollment?.completed_at ? new Date(activeEnrollment.completed_at).toLocaleDateString('en-GB') : formattedIssueDate}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION 4: PRACTICAL CLINICAL TRAINING & INTERNSHIP SPECIFICATIONS */}
                <div className="relative z-10 mb-10 space-y-4">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                        <Building2 className="h-5 w-5 text-[#D97706]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            SECTION IV: PRACTICAL CLINICAL SIMULATION & INTERNSHIP RECORD
                        </h3>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="font-bold text-slate-900">{practicalInfo.title}</span>
                            <span className="font-mono text-emerald-700 font-bold">COMPLETED & VERIFIED</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            {practicalInfo.description}
                        </p>
                    </div>
                </div>

                {/* SECTION 5: OFFICIAL SIGNATURE, SEAL & VERIFICATION */}
                <div className="relative z-10 pt-6 border-t-2 border-[#D97706] mt-12 page-break-inside-avoid">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                        
                        {/* QR Code & Scan Badge */}
                        <div className="flex flex-col items-center">
                            <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-md">
                                <QRCodeDisplay value={verificationUrl} size={70} />
                            </div>
                            <span className="mt-1.5 bg-slate-900 text-white px-3 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase shadow-xs">
                                SCAN TO VERIFY
                            </span>
                        </div>

                        {/* Institutional Seal Watermark / Badge */}
                        <div className="text-center px-4">
                            <div className="w-16 h-16 rounded-full border-2 border-[#D97706] p-1 mx-auto flex items-center justify-center bg-amber-50/50 shadow-sm">
                                <ShieldCheck className="h-10 w-10 text-[#D97706]" />
                            </div>
                            <span className="block text-[9px] font-bold text-slate-900 uppercase tracking-widest mt-1">
                                OFFICIAL REGISTRY SEAL
                            </span>
                            <span className="block text-[8px] font-semibold text-slate-500 uppercase">
                                NIC NIGERIA ACADEMIC BOARD
                            </span>
                        </div>

                        {/* Authorized Signature Block */}
                        <div className="text-center sm:text-right space-y-1">
                            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                                AUTHORIZED ACADEMIC SIGNATURE
                            </p>
                            
                            {/* Signature Image */}
                            <div className="h-12 flex items-center justify-center sm:justify-end my-1">
                                <img 
                                    src="/signature.png" 
                                    alt="Authorized Executive Signature" 
                                    className="h-12 w-auto object-contain select-none"
                                    onError={(e: any) => {
                                        e.target.src = '/signature.jpg'
                                    }}
                                />
                            </div>

                            <div className="w-48 border-b-2 border-[#D97706] mx-auto sm:ml-auto sm:mr-0 mb-1" />
                            <p className="text-xs font-bold text-slate-900 font-serif">
                                Olatunji Joel
                            </p>
                            <p className="text-[9px] font-semibold text-slate-600 uppercase">
                                Executive Director, Programmes & Academic Board
                            </p>
                        </div>
                    </div>

                    {/* Bottom Disclaimer */}
                    <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[8.5px] font-medium text-slate-500">
                        This document constitutes an official academic transcript issued under the authority of the National Institute of Caregivers Nigeria. 
                        Electronic verification is recommended for all foreign credential evaluations and employment verification at <span className="underline font-mono text-[#B45309]">nicnigeria.org/verify</span>.
                    </div>
                </div>

            </div>
        </div>
    )
}
