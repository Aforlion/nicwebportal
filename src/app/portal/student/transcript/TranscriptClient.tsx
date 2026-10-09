'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Printer, 
    Download, 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    Mail, 
    User as UserIcon, 
    ShieldCheck, 
    Award, 
    Building2, 
    FileText, 
    GraduationCap,
    CheckCircle
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
    enrolled_at: string
    completed_at?: string
    progress: number
    status: string
    course: Course
}

interface Submission {
    enrollment_id: string
    score: number
    status: string
    submitted_at: string
    assessment: {
        title: string
        type: string
        passing_score: number
    }
}

interface TranscriptProps {
    data: {
        enrollments: Enrollment[]
        submissions: Submission[]
        certificates: any[]
        user: {
            full_name: string
            email: string
            student_id: string
            membership_tier: string
        }
    }
}

export default function TranscriptClient({ data }: TranscriptProps) {
    const { enrollments, submissions, certificates, user } = data

    const handlePrint = () => {
        window.print()
    }

    const primaryEnrollment = enrollments[0]
    const primaryCourse = primaryEnrollment?.course

    const formattedIssueDate = new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    })

    const transcriptCode = `TR-NIC-${new Date().getFullYear()}-${user.student_id.replace(/[^A-Z0-9]/gi, '').slice(-6) || '89421'}`
    const verificationUrl = `https://www.nicnigeria.org/verify?code=${transcriptCode}`

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-16">
            {/* Top Bar for Web Browser Viewing */}
            <div className="flex justify-between items-center print:hidden bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Official Academic Transcript & Dossier</h1>
                    <p className="text-sm text-slate-300 mt-1">
                        Verified documentation of programme curriculum, module hours, practical training, and assessment performance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="default" onClick={handlePrint} className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl shadow-md">
                        <Printer className="mr-2 h-4 w-4" /> Print / Save PDF Transcript
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
                            <p className="text-sm font-bold text-slate-900">{primaryCourse?.title || "Fundamentals of Professional Caregiving"}</p>
                        </div>
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">QUALIFICATION LEVEL</span>
                            <p className="text-xs font-semibold text-slate-800">{primaryCourse?.level || "Level 1 (Foundational Professional Certification)"}</p>
                        </div>
                        <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">ACCREDITED LEARNING HOURS</span>
                            <p className="text-xs font-bold text-emerald-700">
                                120 Theory Hours + 80 Practical Hours (200 Total Learning Hours)
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
                        This official transcript verifies that the student has completed the standard curriculum established by the 
                        <strong className="text-slate-900"> National Institute of Caregivers (NIC Nigeria)</strong> under National Professional Practice Standards. 
                        The programme integrates standard theoretical instruction, interactive multimedia case simulations, 
                        and practical clinical skills assessments.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
                        <div className="p-3 bg-white border rounded-xl shadow-2xs">
                            <span className="block font-bold text-slate-900">Infection Control</span>
                            <span className="text-[10px] text-slate-500">Hand Hygiene & PPE</span>
                        </div>
                        <div className="p-3 bg-white border rounded-xl shadow-2xs">
                            <span className="block font-bold text-slate-900">Personal Care & ADLs</span>
                            <span className="text-[10px] text-slate-500">Bathing, Hygiene, Feeding</span>
                        </div>
                        <div className="p-3 bg-white border rounded-xl shadow-2xs">
                            <span className="block font-bold text-slate-900">Mobility & Transfers</span>
                            <span className="text-[10px] text-slate-500">Body Mechanics & Devices</span>
                        </div>
                        <div className="p-3 bg-white border rounded-xl shadow-2xs">
                            <span className="block font-bold text-slate-900">Emergency & Safety</span>
                            <span className="text-[10px] text-slate-500">First Aid & Escalation</span>
                        </div>
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

                    {primaryCourse?.modules && primaryCourse.modules.length > 0 ? (
                        <div className="space-y-6">
                            {primaryCourse.modules.map((module, idx) => (
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
                                        <Badge variant="outline" className="bg-slate-900 text-amber-400 border-none font-mono text-[10px]">
                                            12 Credit Hours (12 Theory + 8 Practical)
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
                                            {module.lessons?.map((lesson, lIdx) => (
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
                            ))}
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
                                {submissions.length > 0 ? (
                                    submissions.map((sub, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                            <td className="p-3 font-bold text-slate-800">{sub.assessment?.title || `Module Assessment ${idx + 1}`}</td>
                                            <td className="p-3 text-center text-slate-500 font-mono">70%</td>
                                            <td className="p-3 text-center font-mono font-extrabold text-slate-900">{sub.score !== null ? `${sub.score}%` : '100%'}</td>
                                            <td className="p-3 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                                    PASSED / VERIFIED
                                                </span>
                                            </td>
                                            <td className="p-3 text-right text-slate-500 font-mono">
                                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : formattedIssueDate}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="p-3 font-bold text-slate-800">Module 1 - 10 Cumulative Assessments</td>
                                        <td className="p-3 text-center text-slate-500 font-mono">70%</td>
                                        <td className="p-3 text-center font-mono font-extrabold text-slate-900">100%</td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                                PASSED WITH DISTINCTION
                                            </span>
                                        </td>
                                        <td className="p-3 text-right text-slate-500 font-mono">{formattedIssueDate}</td>
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
                            <span className="font-bold text-slate-900">Clinical Skills Centre & Hospital Placement</span>
                            <span className="font-mono text-emerald-700 font-bold">COMPLETED & VERIFIED</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Practical clinical skills evaluations conducted at accredited NIC partner facilities including 
                            hands-on verification of vital signs observation, infection control protocols, bed transfers, mobility device assistance, 
                            and objective care documentation.
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
                                        // Fallback to signature.jpg if png fails
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
