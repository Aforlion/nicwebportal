"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    ShieldCheck,
    AlertTriangle,
    ArrowRight,
    History as HistoryIcon,
    MapPin,
    Building2,
    CalendarCheck,
    Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccreditationTracker } from "@/components/facility/accreditation-tracker"
import Image from "next/image"

export default function FacilityDashboard() {
    const [loading, setLoading] = useState(true)
    const [facility, setFacility] = useState<any>(null)
    const [staffCount, setStaffCount] = useState(0)
    const [pillarScores, setPillarScores] = useState<any[]>([])
    const [docs, setDocs] = useState<{document_name: string, status: string}[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        fetchFacilityData()
    }, [])

    const fetchFacilityData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Facility
            const { data: facData } = await supabase
                .from('facilities')
                .select('*')
                .eq('owner_id', user.id)
                .single()

            setFacility(facData)

            if (facData) {
                // 2. Fetch Staff Count
                const { count } = await supabase
                    .from('facility_staff')
                    .select('*', { count: 'exact', head: true })
                    .eq('facility_id', facData.id)
                    .eq('is_active', true)

                setStaffCount(count || 0)

                // 3. Fetch Latest Inspection Scores
                const { data: scores } = await supabase
                    .from('inspection_scores')
                    .select('pillar, score')
                    .eq('inspection_id', (
                        await supabase
                        .from('inspections')
                        .select('id')
                        .eq('facility_id', facData.id)
                        .order('conducted_at', { ascending: false })
                        .limit(1)
                        .single()
                    ).data?.id)

                if (scores) {
                    setPillarScores(scores.map(s => ({ name: s.pillar, score: s.score })))
                }

                // 4. Fetch Documents Status
                const { data: docData } = await supabase
                    .from('documents')
                    .select('document_name, status')
                    .eq('membership_id', (
                        await supabase
                        .from('memberships')
                        .select('id')
                        .eq('user_id', user.id)
                        .single()
                    ).data?.id)
                
                if (docData) setDocs(docData)

                // 5. Fetch Recommended Courses
                const { data: coursesData } = await supabase
                    .from('courses')
                    .select('id, title, slug, description, level, price, duration_hours, thumbnail_url')
                    .in('slug', [
                        'nic-care-business-agency-development-program-level-5',
                        'nic-care-supervisor-facility-manager-level-4',
                        'advanced-care-practitioner'
                    ])

                if (coursesData) {
                    const orderedSlugs = [
                        'nic-care-business-agency-development-program-level-5',
                        'nic-care-supervisor-facility-manager-level-4',
                        'advanced-care-practitioner'
                    ];
                    const sortedCourses = [...coursesData].sort((a, b) => 
                        orderedSlugs.indexOf(a.slug) - orderedSlugs.indexOf(b.slug)
                    );
                    setCourses(sortedCourses)
                }
            }
        } catch (err) {
            console.error("Error fetching facility dashboard:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading Institutional Dashboard...</div>

    if (!facility) return (
        <Card className="max-w-xl mx-auto mt-20">
            <CardHeader>
                <CardTitle>Facility Registration Not Found</CardTitle>
                <CardDescription>If you recently registered, your account may still be under review.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" asChild>
                    <a href="/join/facility">Register New Facility</a>
                </Button>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-8 relative overflow-hidden">
            {/* Decorative Background Coat of Arms */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none -translate-y-12 translate-x-12">
                <Image src="/coat-of-arm.png" alt="" width={300} height={300} />
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block p-2 bg-white rounded-xl border shadow-sm">
                        <Image src="/logo.jpg" alt="NIC" width={48} height={48} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-secondary">Institutional Dashboard</h1>
                        <p className="text-muted-foreground">Manage {facility.name} registration and staff compliance.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className={`h-8 px-4 text-xs font-bold ${facility.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                        STATUS: {facility.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Staff</p>
                                <p className="text-2xl font-bold text-secondary">{staffCount}</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Compliance Score</p>
                                <p className="text-2xl font-bold text-emerald-600">{facility.score || 0}%</p>
                            </div>
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-accent uppercase tracking-widest">Next Inspection</p>
                                <p className="text-sm font-bold text-secondary">
                                    {facility.next_inspection_date ? new Date(facility.next_inspection_date).toLocaleDateString() : 'Not Scheduled'}
                                </p>
                            </div>
                            <CalendarCheck className="h-8 w-8 text-accent" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-secondary uppercase tracking-widest">Registry ID</p>
                                <p className="text-[10px] font-mono font-bold text-muted-foreground truncate max-w-[100px]">{facility.registration_number}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-slate-300" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Facility Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Facility Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Address</p>
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {facility.address}, {facility.city}, {facility.state}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Capacity</p>
                                <p className="text-sm font-medium text-secondary">{facility.capacity} Residents/Patients</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-secondary">Recent Staff Additions</h3>
                                <Button variant="link" className="text-primary text-xs h-auto p-0" asChild>
                                    <a href="/portal/facility/staff">View All Staff</a>
                                </Button>
                            </div>
                            <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm italic">Staff linking active. Start adding your caregivers to enable verification.</p>
                                <Button size="sm" variant="outline" className="mt-4" asChild>
                                    <a href="/portal/facility/link">Link a Caregiver</a>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & Compliance */}
                <div className="space-y-6">
                    <Card className="border-accent/10 bg-accent/5">
                        <CardHeader>
                            <CardTitle className="text-sm">Compliance Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: "Regulatory License", type: "license" },
                                { name: "Insurance Policy", type: "insurance" },
                                { name: "Fire Safety Cert", type: "fire_safety" }
                            ].map(item => {
                                const doc = docs.find(d => d.document_name.toLowerCase().includes(item.type))
                                const status = doc?.status?.toUpperCase() || "MISSING"
                                return (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <span>{item.name}</span>
                                        <Badge className={`border-none px-2 h-5 ${
                                            status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                                            status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{status}</Badge>
                                    </div>
                                )
                            })}
                            <Button className="w-full text-xs" variant="outline" size="sm" asChild>
                                <a href="/portal/facility/certificates">Manage Documents</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <AccreditationTracker 
                        level={facility.accreditation_level} 
                        grade={facility.grade}
                        expiryDate={facility.license_expiry}
                        pillarScores={pillarScores}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                <div className="p-4 flex gap-3 hover:bg-muted/30 transition-colors">
                                    <HistoryIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-secondary">Facility registered successfully</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(facility.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recommended Courses Section */}
            {courses.length > 0 && (
                <div className="mt-8 border-t pt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                Recommended Training & Courses
                            </h2>
                            <p className="text-muted-foreground text-sm">Enhance your staff&apos;s compliance, skills, and care delivery standards.</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-fit flex items-center gap-2 border-primary text-primary hover:bg-primary/5" asChild>
                            <a href="/programs">
                                Browse All Courses
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                                            <Briefcase className="h-10 w-10 text-primary/20" />
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
                                            <span className="font-bold text-secondary">{course.duration_hours || 0} hrs</span> study time
                                        </div>
                                        <div className="font-bold text-primary text-sm">
                                            ₦{Number(course.price).toLocaleString()}
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0">
                                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold group-hover:bg-primary group-hover:text-white transition-all border-primary/25 group-hover:border-primary" asChild>
                                        <a href={`/programs/${course.slug}`}>View Syllabus</a>
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
