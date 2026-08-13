'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    GraduationCap,
    BookOpen,
    Award,
    Users,
    Building2,
    ShieldCheck,
    CheckCircle2,
    Clock,
    FileText,
    Upload,
    Search,
    UserCheck,
    ArrowRight,
    Sparkles,
    CheckCircle,
    AlertCircle,
    Info,
    ExternalLink
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import Image from "next/image"

interface TrainingAgencyDashboardProps {
    facility: any
    staffCount: number
    courses: any[]
}

export function TrainingAgencyDashboard({ facility, staffCount, courses }: TrainingAgencyDashboardProps) {
    const [instructors, setInstructors] = useState<any[]>([])
    const [trainees, setTrainees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [curriculumUrl, setCurriculumUrl] = useState(facility.curriculum_url || "")
    const [isUpdatingCurriculum, setIsUpdatingCurriculum] = useState(false)
    const [curriculumStatus, setCurriculumStatus] = useState(facility.curriculum_status || "under_review")
    const supabase = createClient()

    useEffect(() => {
        loadAgencyData()
    }, [])

    const loadAgencyData = async () => {
        setLoading(true)
        try {
            // 1. Load Instructors linked to this training facility
            const { data: staffData } = await supabase
                .from('facility_staff')
                .select(`
                    id,
                    role_title,
                    is_active,
                    created_at,
                    profiles:user_id (
                        id,
                        full_name,
                        email,
                        phone,
                        avatar_url,
                        is_approved_instructor,
                        role
                    )
                `)
                .eq('facility_id', facility.id)

            if (staffData) {
                setInstructors(staffData)
            }

            // 2. Load Trainees registered under this institution code
            if (facility.institution_code) {
                const { data: traineeData } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, created_at, avatar_url, role')
                    .eq('training_facility_id', facility.id)
                    .limit(50)

                if (traineeData) {
                    setTrainees(traineeData)
                }
            }
        } catch (err) {
            console.error("Error loading training agency data:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCurriculum = async () => {
        if (!curriculumUrl.trim()) {
            toast.error("Please provide a valid document URL for your curriculum.")
            return
        }
        setIsUpdatingCurriculum(true)
        try {
            const { error } = await supabase
                .from('facilities')
                .update({
                    curriculum_url: curriculumUrl,
                    curriculum_status: 'pending'
                })
                .eq('id', facility.id)

            if (error) throw error
            setCurriculumStatus('pending')
            toast.success("Curriculum document submitted for NIC Board evaluation!")
        } catch (err: any) {
            toast.error(err.message || "Failed to update curriculum link.")
        } finally {
            setIsUpdatingCurriculum(false)
        }
    }

    const filteredInstructors = instructors.filter(i => {
        const name = i.profiles?.full_name || ""
        const email = i.profiles?.email || ""
        const role = i.role_title || ""
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               email.toLowerCase().includes(searchQuery.toLowerCase()) ||
               role.toLowerCase().includes(searchQuery.toLowerCase())
    })

    return (
        <div className="space-y-8 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.03] pointer-events-none -translate-y-16 translate-x-16">
                <Image src="/coat-of-arm.png" alt="" width={320} height={320} />
            </div>

            {/* Header section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                        <GraduationCap className="h-7 w-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-extrabold text-secondary tracking-tight">{facility.name}</h1>
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-xs uppercase">
                                NIC TRAINING PARTNER
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Accredited Training Institution & Educator Portal — NIC Framework Compliant.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Badge variant="outline" className={`h-8 px-4 text-xs font-bold ${
                        facility.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                        STATUS: {facility.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {/* Framework Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="hover:shadow-md transition-all border-l-4 border-l-primary">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Institution Code</p>
                            <p className="text-xl font-mono font-extrabold text-secondary mt-1">
                                {facility.institution_code || facility.registration_number || 'TRN-PENDING'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">For Student Self-Enrollment</p>
                        </div>
                        <Building2 className="h-8 w-8 text-primary opacity-80" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Curriculum Status</p>
                            <div className="mt-1">
                                <Badge className={`text-xs font-bold uppercase ${
                                    curriculumStatus === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                    curriculumStatus === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                    'bg-blue-100 text-blue-700 border-blue-300'
                                }`}>
                                    {curriculumStatus === 'approved' ? 'NIC Certified' : curriculumStatus === 'pending' ? 'Under Review' : 'Submission Required'}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1.5">NIC Education Standard</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-emerald-500 opacity-80" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-l-4 border-l-amber-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approved Instructors</p>
                            <p className="text-3xl font-extrabold text-secondary mt-1">{instructors.length}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Certified RN/RM & Care Trainers</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-amber-500 opacity-80" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-l-4 border-l-accent">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enrolled Trainees</p>
                            <p className="text-3xl font-extrabold text-accent mt-1">{trainees.length}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Linked Student Candidates</p>
                        </div>
                        <Users className="h-8 w-8 text-accent opacity-80" />
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Sections */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Curriculum & Accreditation Framework Module */}
                <Card className="lg:col-span-2 shadow-sm border border-muted">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-amber-500/5 border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-secondary">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    NIC Curriculum & Education Framework Alignment
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    Submit your training syllabus and module outlines to receive official NIC Accreditation.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-white font-mono text-[10px] uppercase">
                                Framework v2.4
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Status banner */}
                        <div className="rounded-xl border p-4 bg-muted/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex items-center gap-3">
                                {curriculumStatus === 'approved' ? (
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-secondary text-sm">
                                        {curriculumStatus === 'approved' 
                                            ? 'NIC Approved Training Center' 
                                            : curriculumStatus === 'pending'
                                            ? 'Curriculum Evaluation in Progress'
                                            : 'Upload Curriculum Outline for Verification'}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {curriculumStatus === 'approved'
                                            ? 'Your curriculum satisfies NIC Caregiver Education System standards for Theory & Clinical Practice.'
                                            : 'The NIC Academic Board reviews submitted curricula within 3-5 business days.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Curriculum Submission Form */}
                        <div className="space-y-4 pt-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-primary" />
                                Curriculum / Syllabus Document URL (PDF / Cloud Link)
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input 
                                    placeholder="https://drive.google.com/file/d/... or http://..."
                                    value={curriculumUrl}
                                    onChange={(e) => setCurriculumUrl(e.target.value)}
                                    className="flex-1 text-sm"
                                />
                                <Button 
                                    onClick={handleSaveCurriculum}
                                    disabled={isUpdatingCurriculum}
                                    className="bg-primary hover:bg-primary/90 font-semibold"
                                >
                                    {isUpdatingCurriculum ? "Saving..." : "Submit Syllabus"}
                                    <Upload className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            {facility.curriculum_url && (
                                <div className="text-xs flex items-center gap-1 text-primary">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <a href={facility.curriculum_url} target="_blank" rel="noreferrer" className="underline font-medium">
                                        View Current Submitted Curriculum Document
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Framework Guidelines Summary */}
                        <div className="border-t pt-4 space-y-3">
                            <h4 className="font-bold text-secondary text-sm flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                Mandatory NIC Training Standards Checklist
                            </h4>
                            <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                                <div className="p-3 rounded-lg border bg-white flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-secondary block">Structured Module Hours</span>
                                        <span className="text-muted-foreground">Min. 40 hours classroom theory & practical care drills.</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border bg-white flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-secondary block">Clinical Practicum Linkage</span>
                                        <span className="text-muted-foreground">Partnered with licensed hospitals/care homes for internships.</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border bg-white flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-secondary block">Qualified Instructor Ratio</span>
                                        <span className="text-muted-foreground">1 NIC-approved instructor per 25 trainees.</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border bg-white flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-secondary block">Standardized Assessment</span>
                                        <span className="text-muted-foreground">NIC final evaluation & practical skill check compliance.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Institution Code & Quick Actions */}
                <div className="space-y-6">
                    <Card className="border-amber-200 bg-amber-50/40">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-600" />
                                Student Enrollment Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-amber-800">
                                Share this institutional code with your students. They can input it when signing up to automatically link their portal to your training agency.
                            </p>
                            <div className="p-3 bg-white border border-amber-200 rounded-xl text-center shadow-xs">
                                <span className="text-xs uppercase font-bold text-muted-foreground block">Your Institution Code</span>
                                <span className="text-xl font-mono font-extrabold text-secondary tracking-wider block mt-0.5 select-all">
                                    {facility.institution_code || facility.registration_number || 'PENDING'}
                                </span>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs font-semibold border-amber-300 text-amber-900 hover:bg-amber-100"
                                onClick={() => {
                                    const code = facility.institution_code || facility.registration_number
                                    if (code) {
                                        navigator.clipboard.writeText(code)
                                        toast.success("Institution code copied to clipboard!")
                                    }
                                }}
                            >
                                Copy Institution Code
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Approved Instructors Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                                Instructors must be registered with NIC (Registered Nurse, Midwife, or Level 4/5 Supervisor).
                            </p>
                            <div className="rounded-lg border p-3 text-center bg-muted/20">
                                <p className="text-2xl font-bold text-secondary">{instructors.length}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Total Instructors Onboarded</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                                <a href="/portal/facility/staff">Manage Training Staff</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Approved Instructors Directory */}
            <Card className="border border-muted shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-secondary">
                            <UserCheck className="h-5 w-5 text-amber-600" />
                            Approved Instructors & Training Faculty
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Registered faculty members certified to deliver NIC caregiver education modules.
                        </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search instructor name or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs w-full"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            <span className="animate-pulse">Loading training faculty directory...</span>
                        </div>
                    ) : filteredInstructors.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground space-y-3">
                            <Users className="h-10 w-10 mx-auto opacity-20" />
                            <p className="text-sm">No instructors linked to this training agency yet.</p>
                            <Button variant="outline" size="sm" asChild>
                                <a href="/portal/facility/staff">Link New Instructor</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-muted bg-muted/20">
                                        <th className="py-3 px-4 font-bold text-secondary">Instructor Name</th>
                                        <th className="py-3 px-4 font-bold text-secondary">Role Title</th>
                                        <th className="py-3 px-4 font-bold text-secondary">NIC Approval Status</th>
                                        <th className="py-3 px-4 font-bold text-secondary text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/50">
                                    {filteredInstructors.map((inst) => (
                                        <tr key={inst.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-3 px-4 flex items-center gap-3">
                                                <div className="h-9 w-9 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold overflow-hidden border">
                                                    {inst.profiles?.avatar_url ? (
                                                        <Image src={inst.profiles.avatar_url} alt={inst.profiles.full_name} width={36} height={36} className="h-full w-full object-cover" />
                                                    ) : (
                                                        (inst.profiles?.full_name || "I")[0]
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-secondary block">{inst.profiles?.full_name || "Faculty Member"}</span>
                                                    <span className="text-xs text-muted-foreground block">{inst.profiles?.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                                                {inst.role_title || "Instructor"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={inst.profiles?.is_approved_instructor ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                                                    {inst.profiles?.is_approved_instructor ? "NIC Approved Trainer" : "Pending Verification"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
                                                    <a href="/portal/facility/staff">Details</a>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recommended NIC Training Syllabi & Course Catalog */}
            {courses.length > 0 && (
                <div className="mt-8 border-t pt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                Accredited NIC Caregiver Curricula & Programs
                            </h2>
                            <p className="text-muted-foreground text-sm">Official NIC certification syllabi available for your institution to deliver.</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-fit flex items-center gap-2 border-primary text-primary hover:bg-primary/5" asChild>
                            <a href="/programs">
                                Browse All Curricula
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="group overflow-hidden border border-muted hover:border-primary/30 hover:shadow-md transition-all flex flex-col h-full bg-white">
                                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                    {course.thumbnail_url ? (
                                        <Image 
                                            src={course.thumbnail_url} 
                                            alt={course.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                            <GraduationCap className="h-10 w-10 text-primary/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-primary/90 text-white backdrop-blur text-[10px] uppercase font-bold py-0.5 px-2 border-none">
                                            {course.level || 'Professional'}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-secondary text-sm line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-1" title={course.title}>
                                            {course.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                                            {course.description}
                                        </p>
                                    </div>
                                    <div className="pt-3 border-t border-muted flex items-center justify-between mt-auto">
                                        <div className="text-xs text-muted-foreground">
                                            <span className="font-bold text-secondary">{course.duration_hours || 0} hrs</span> syllabus
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0">
                                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold group-hover:bg-primary group-hover:text-white transition-all border-primary/25 group-hover:border-primary" asChild>
                                        <a href={`/programs/${course.slug}`}>View Official Syllabus</a>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
