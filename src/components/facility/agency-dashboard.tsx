'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Users,
    Search,
    BookOpen,
    GraduationCap,
    Award,
    MapPin,
    Building2,
    Calendar,
    Briefcase,
    Mail,
    Phone,
    ArrowRight,
    Star,
    CheckCircle,
    UserCheck,
    ChevronRight,
    X,
    ThumbsUp
} from "lucide-react"
import { getCaregivers, recommendCourse } from "@/actions/facility/agency"
import Image from "next/image"

interface AgencyDashboardProps {
    facility: any
    staffCount: number
    courses: any[]
}

export function AgencyDashboard({ facility, staffCount, courses }: AgencyDashboardProps) {
    const [caregivers, setCaregivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCaregiver, setSelectedCaregiver] = useState<any | null>(null)
    const [recommendingCourseId, setRecommendingCourseId] = useState("")
    const [submittingRec, setSubmittingRec] = useState(false)

    useEffect(() => {
        loadCaregivers()
    }, [])

    const loadCaregivers = async () => {
        setLoading(true)
        const res = await getCaregivers()
        if (res.error) {
            toast.error(res.error)
        } else if (res.caregivers) {
            setCaregivers(res.caregivers)
        }
        setLoading(false)
    }

    const handleRecommend = async () => {
        if (!selectedCaregiver || !recommendingCourseId) return
        setSubmittingRec(true)
        const res = await recommendCourse(selectedCaregiver.id, recommendingCourseId)
        setSubmittingRec(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            if (res.warning) {
                toast.warning(res.warning)
            } else {
                toast.success("Training recommended successfully!")
            }
            setRecommendingCourseId("")
            // Reload caregiver list to get any status updates (or just close modal)
            setSelectedCaregiver(null)
        }
    }

    // Filter caregivers based on search query
    const filteredCaregivers = caregivers.filter(c => 
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.qualification.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 relative">
            {/* Header section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Care Agency Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your recruitment pipeline, search certified caregivers, and recommend training for {facility.name}.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 h-8 px-4 font-bold text-xs uppercase">
                        AGENCY PORTAL
                    </Badge>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="hover:shadow-md transition-all border-l-4 border-l-primary">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Connected Caregivers</p>
                            <p className="text-3xl font-extrabold text-secondary mt-1">{staffCount}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary opacity-80" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">NIC Candidate Pool</p>
                            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{caregivers.length}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-emerald-500 opacity-80" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-l-4 border-l-accent">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accreditation Level</p>
                            <p className="text-xl font-extrabold text-secondary mt-2">
                                {facility.accreditation_level ? `Level ${facility.accreditation_level}` : 'Under Review'}
                            </p>
                        </div>
                        <Award className="h-8 w-8 text-accent opacity-80" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all border-l-4 border-l-slate-400">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Agency Code</p>
                            <p className="text-sm font-mono font-bold text-slate-700 mt-2 select-all">
                                {facility.institution_code || (facility.registration_number?.startsWith('NIC/') ? facility.registration_number : 'Pending Code')}
                            </p>
                        </div>
                        <Building2 className="h-8 w-8 text-slate-400 opacity-80" />
                    </CardContent>
                </Card>
            </div>

            {/* Caregivers Directory */}
            <Card className="border border-muted shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            NIC Certified Caregivers & Candidates
                        </CardTitle>
                        <CardDescription>Search our registry of certified caregivers. Review profiles and recommend career progression courses.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name, NIC ID, qualification..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 w-full"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <span className="animate-pulse">Loading caregivers directory...</span>
                        </div>
                    ) : filteredCaregivers.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No caregivers match your search query.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-muted bg-muted/20">
                                        <th className="py-3 px-4 font-bold text-secondary">Caregiver</th>
                                        <th className="py-3 px-4 font-bold text-secondary">NIC ID</th>
                                        <th className="py-3 px-4 font-bold text-secondary">Qualification</th>
                                        <th className="py-3 px-4 font-bold text-secondary">Experience</th>
                                        <th className="py-3 px-4 font-bold text-secondary text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/50">
                                    {filteredCaregivers.map((c) => (
                                        <tr key={c.id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="py-3 px-4 flex items-center gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border">
                                                    {c.avatarUrl ? (
                                                        <Image src={c.avatarUrl} alt={c.fullName} width={40} height={40} className="h-full w-full object-cover" />
                                                    ) : (
                                                        c.fullName[0]
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-secondary block group-hover:text-primary transition-colors">{c.fullName}</span>
                                                    <span className="text-xs text-muted-foreground block">{c.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {c.nicId}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{c.qualification}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{c.experience} years</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-primary hover:bg-primary/5 hover:text-primary-hover flex items-center gap-1 ml-auto"
                                                    onClick={() => setSelectedCaregiver(c)}
                                                >
                                                    View Profile
                                                    <ChevronRight className="h-4 w-4" />
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

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {selectedCaregiver && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-muted"
                        >
                            {/* Modal Header */}
                            <div className="relative p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5 flex items-start gap-4">
                                <div className="h-16 w-16 shrink-0 rounded-2xl bg-white border shadow-sm overflow-hidden flex items-center justify-center text-primary text-2xl font-bold">
                                    {selectedCaregiver.avatarUrl ? (
                                        <Image src={selectedCaregiver.avatarUrl} alt={selectedCaregiver.fullName} width={64} height={64} className="h-full w-full object-cover" />
                                    ) : (
                                        selectedCaregiver.fullName[0]
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-secondary">{selectedCaregiver.fullName}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1.5 items-center text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            {selectedCaregiver.email}
                                        </span>
                                        {selectedCaregiver.phone && (
                                            <span className="flex items-center gap-1 border-l pl-2">
                                                <Phone className="h-3.5 w-3.5" />
                                                {selectedCaregiver.phone}
                                            </span>
                                        )}
                                        <span className="border-l pl-2">
                                            NIC ID: <strong className="font-mono text-secondary">{selectedCaregiver.nicId}</strong>
                                        </span>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-4 right-4 text-muted-foreground hover:bg-muted"
                                    onClick={() => setSelectedCaregiver(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Caregiver Details */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-secondary border-b pb-2 text-sm uppercase tracking-wide">Professional Details</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Qualification:</span>
                                                <span className="font-medium text-secondary">{selectedCaregiver.qualification}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Years of Experience:</span>
                                                <span className="font-medium text-secondary">{selectedCaregiver.experience} years</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Membership Status:</span>
                                                <Badge className={selectedCaregiver.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                    {selectedCaregiver.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommend Course Form */}
                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-primary flex items-center gap-1.5 text-sm uppercase tracking-wide mb-1.5">
                                                <BookOpen className="h-4 w-4" />
                                                Recommend Training
                                            </h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                                Encourage {selectedCaregiver.fullName} to expand their caregiver capabilities by recommending active courses.
                                            </p>
                                            <select 
                                                value={recommendingCourseId}
                                                onChange={(e) => setRecommendingCourseId(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
                                            >
                                                <option value="">-- Select NIC Course --</option>
                                                {courses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button 
                                            className="w-full bg-primary" 
                                            disabled={!recommendingCourseId || submittingRec}
                                            onClick={handleRecommend}
                                        >
                                            {submittingRec ? "Submitting..." : "Send Course Recommendation"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Qualifications & Certifications */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-secondary border-b pb-2 text-sm uppercase tracking-wide">NIC Certifications</h4>
                                    {selectedCaregiver.certificates.length === 0 ? (
                                        <p className="text-xs italic text-muted-foreground">No completed NIC certifications found.</p>
                                    ) : (
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {selectedCaregiver.certificates.map((cert: any) => (
                                                <div key={cert.id} className="p-3 border rounded-xl flex items-start gap-2.5 bg-muted/10">
                                                    <Award className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold text-xs text-secondary block">{cert.courseTitle}</span>
                                                        <span className="text-[10px] text-muted-foreground block font-mono">No: {cert.number}</span>
                                                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                                                            <CheckCircle className="h-3 w-3" /> Verified Certificate
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Enrollments */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-secondary border-b pb-2 text-sm uppercase tracking-wide">Ongoing Studies</h4>
                                    {selectedCaregiver.enrollments.length === 0 ? (
                                        <p className="text-xs italic text-muted-foreground">No active course enrollments.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedCaregiver.enrollments.map((enr: any) => (
                                                <div key={enr.id} className="flex justify-between items-center p-3 border rounded-xl text-xs bg-slate-50">
                                                    <div>
                                                        <span className="font-semibold text-secondary block">{enr.courseTitle}</span>
                                                        <span className="text-[10px] text-muted-foreground block uppercase font-bold mt-0.5">Status: {enr.status}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-primary block">{enr.progress}% Done</span>
                                                        <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                                                            <div className="bg-primary h-full" style={{ width: `${enr.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
