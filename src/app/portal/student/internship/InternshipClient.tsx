'use client'

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Clock, MapPin, Users, Sparkles, Building2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase"
import { saveInternshipRecord } from "@/actions/member/internships"

interface Internship {
    id: string
    start_date: string
    end_date: string
    custom_facility_name: string
    certificate_url: string
    status: string
    created_at: string
}

interface LocationItem {
    id: string
    city_name: string
    state: string
    address: string
    status: string
    default_fee_amount: number | null
}

interface CohortItem {
    id: string
    location_id: string
    cohort_name: string
    start_date: string
    end_date: string
    late_join_deadline: string
    max_capacity: number
    current_enrolled: number
    fee_amount: number
    status: string
    location?: LocationItem
}

interface InternshipClientProps {
    initialInternships: Internship[]
}

export default function InternshipClient({ initialInternships }: InternshipClientProps) {
    const [internships, setInternships] = useState<Internship[]>(initialInternships)
    const [locations, setLocations] = useState<LocationItem[]>([])
    const [cohorts, setCohorts] = useState<CohortItem[]>([])
    const [loadingData, setLoadingData] = useState(true)

    // Form state
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [facilityName, setFacilityName] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [bookingCohortId, setBookingCohortId] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCohortsAndLocations() {
            try {
                const { data: locs } = await supabase
                    .from('internship_locations')
                    .select('*')
                    .order('city_name', { ascending: true })

                setLocations(locs || [])

                const { data: chs } = await supabase
                    .from('internship_cohorts')
                    .select('*, location:internship_locations(*)')
                    .order('start_date', { ascending: true })

                setCohorts(chs || [])
            } catch (err) {
                console.error("Error loading cohort data:", err)
            } finally {
                setLoadingData(false)
            }
        }
        fetchCohortsAndLocations()
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be smaller than 10MB")
            return
        }
        setSelectedFile(file)
    }

    const handleUploadInternship = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!startDate || !endDate || !facilityName || !selectedFile) {
            toast.error("Please fill in all fields and select a certificate file")
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        const durationMs = end.getTime() - start.getTime()
        const durationDays = durationMs / (1000 * 60 * 60 * 24)

        if (durationDays < 89) {
            toast.error("Internship duration must be at least 3 months")
            return
        }

        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Session expired. Please log in again.")
                return
            }

            const ext = selectedFile.name.split('.').pop()
            const storagePath = `internships/${user.id}/${Date.now()}_certificate.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('member-documents')
                .upload(storagePath, selectedFile, { upsert: false })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('member-documents')
                .getPublicUrl(storagePath)

            const res = await saveInternshipRecord({
                startDate,
                endDate,
                certificateUrl: publicUrl,
                customFacilityName: facilityName
            })

            if (res.success) {
                toast.success("Internship certificate uploaded successfully! Awaiting admin review.")
                const newRecord: Internship = {
                    id: Math.random().toString(),
                    start_date: startDate,
                    end_date: endDate,
                    custom_facility_name: facilityName,
                    certificate_url: publicUrl,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
                setInternships(prev => [newRecord, ...prev])
                setStartDate("")
                setEndDate("")
                setFacilityName("")
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
            } else {
                toast.error(res.error || "Failed to save record")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to complete upload")
        } finally {
            setUploading(false)
        }
    }

    const handleBookCohort = async (cohort: CohortItem) => {
        setBookingCohortId(cohort.id)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Please log in to book your internship seat.")
                return
            }

            // Record enrollment in internship_enrollments
            const { error } = await supabase.from('internship_enrollments').insert({
                student_id: user.id,
                cohort_id: cohort.id,
                location_id: cohort.location_id,
                fee_paid: cohort.fee_amount,
                status: 'enrolled'
            })

            if (error) {
                if (error.code === '23505') {
                    toast.error("You are already enrolled in this cohort!")
                } else {
                    throw error
                }
            } else {
                // Increment current enrolled count
                await supabase.from('internship_cohorts')
                    .update({ current_enrolled: cohort.current_enrolled + 1 })
                    .eq('id', cohort.id)

                toast.success(`Seat reserved for ${cohort.cohort_name}! Proceeding to placement onboarding.`)
                
                // Update local state
                setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, current_enrolled: c.current_enrolled + 1 } : c))
            }
        } catch (err: any) {
            toast.error("Booking error: " + err.message)
        } finally {
            setBookingCohortId(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>
            case 'rejected':
                return <Badge className="bg-red-500 hover:bg-red-600"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
            default:
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="h-3 w-3 mr-1" />Awaiting Review</Badge>
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Clinical Internship & Placement Schedules</h1>
                <p className="text-muted-foreground">Select a 3-month clinical cohort (capped at 20 students) or submit your verified external placement certificate.</p>
            </div>

            {/* LOCATION PRICING & SELECTION GRID */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Available Internship Locations & Fees
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map((loc) => {
                        const isActive = loc.status === 'active'
                        return (
                            <div 
                                key={loc.id}
                                className={`border rounded-2xl p-5 bg-white transition-all shadow-sm ${
                                    isActive ? 'border-primary/40 ring-1 ring-primary/20' : 'border-slate-200 opacity-90'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{loc.state}</span>
                                    {isActive ? (
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">● Active & Ready</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">⏳ Coming Soon</Badge>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-secondary">{loc.city_name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{loc.address || "Placement facility network."}</p>
                                
                                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Placement Fee:</span>
                                    <span className="font-extrabold text-secondary text-sm">
                                        {loc.default_fee_amount ? `₦${Number(loc.default_fee_amount).toLocaleString()}` : "TBD"}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* UPCOMING 3-MONTH COHORTS GRID */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Scheduled 3-Month Cohorts (Max 20 Capacity)
                </h2>

                {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">Loading available internship cohorts...</div>
                ) : cohorts.length === 0 ? (
                    <Card className="border p-8 text-center text-muted-foreground">
                        No upcoming cohorts scheduled at this moment.
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {cohorts.map((ch) => {
                            const isFull = ch.current_enrolled >= ch.max_capacity
                            const startDateObj = new Date(ch.start_date)
                            const endDateObj = new Date(ch.end_date)
                            const lateDeadlineObj = new Date(ch.late_join_deadline)
                            const now = new Date()
                            const isLateJoinAvailable = now >= startDateObj && now <= lateDeadlineObj && !isFull

                            return (
                                <Card key={ch.id} className="border shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {ch.location?.city_name || "Abuja"}
                                                </Badge>
                                                <span className="text-sm font-extrabold text-secondary">
                                                    ₦{Number(ch.fee_amount).toLocaleString()}
                                                </span>
                                                {isFull ? (
                                                    <Badge className="bg-red-500">Full (20/20)</Badge>
                                                ) : isLateJoinAvailable ? (
                                                    <Badge className="bg-amber-500 text-white flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3" /> Late Join Open until {format(lateDeadlineObj, "MMM d")}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-500">Open for Enrolment</Badge>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-secondary">{ch.cohort_name}</h3>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                                    <strong>Duration (3 Mos):</strong> {format(startDateObj, "MMM d, yyyy")} - {format(endDateObj, "MMM d, yyyy")}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Users className="h-3.5 w-3.5 text-primary" />
                                                    <strong>Capacity:</strong> {ch.current_enrolled} / {ch.max_capacity} Seats
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleBookCohort(ch)}
                                            disabled={isFull || bookingCohortId === ch.id}
                                            className="bg-primary hover:bg-primary/90 min-w-[140px]"
                                        >
                                            {bookingCohortId === ch.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isFull ? (
                                                "Cohort Full"
                                            ) : (
                                                "Reserve Seat"
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* EXTERNAL CERTIFICATE UPLOAD SECTION */}
            <div className="grid md:grid-cols-3 gap-8 pt-4">
                <Card className="md:col-span-2 border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Already Completed External Internship?</CardTitle>
                        <CardDescription>If you completed a 3-month clinical placement at an approved hospital independently, upload your certificate here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUploadInternship} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Input 
                                        id="startDate"
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date *</Label>
                                    <Input 
                                        id="endDate"
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="facilityName">Clinical Training Facility *</Label>
                                <Input 
                                    id="facilityName"
                                    placeholder="e.g. National Hospital Abuja, or St. Nicholas Hospital Lagos"
                                    required
                                    value={facilityName}
                                    onChange={(e) => setFacilityName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Certificate Upload (PDF or Image, max 10MB) *</Label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
                                >
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        onChange={handleFileSelect}
                                    />
                                    {selectedFile ? (
                                        <div className="space-y-1">
                                            <FileText className="h-8 w-8 text-primary mx-auto" />
                                            <p className="text-sm font-semibold text-secondary">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                                            <p className="text-sm font-semibold text-secondary">Click to browse or drop certificate</p>
                                            <p className="text-xs text-muted-foreground">Only PDF, PNG, or JPEG formats supported</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-primary"
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading Certificate...
                                    </>
                                ) : "Submit External Certificate"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Requirements Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border border-primary/10 rounded-2xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">NCNA Pathway Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs text-secondary">
                            <div className="flex gap-2.5 items-start">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">3-Month Internship Duration</p>
                                    <p className="text-muted-foreground">Practical training takes exactly 3 months per cohort.</p>
                                </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Location Pricing</p>
                                    <p className="text-muted-foreground">Abuja (₦200k), Lagos (₦150k), Uyo (₦200k), others TBD.</p>
                                </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Late Join Grace Period</p>
                                    <p className="text-muted-foreground">Join active classes up to 1 month after start if space permits.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* History Table */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Placement Verification History</CardTitle>
                    <CardDescription>Monitor approvals and review statuses of your submitted internships.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {internships.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No internship placements submitted yet.
                            </div>
                        ) : (
                            internships.map((intern) => (
                                <div key={intern.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-secondary">{intern.custom_facility_name}</span>
                                            {getStatusBadge(intern.status)}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(intern.start_date), "MMM d, yyyy")} - {format(new Date(intern.end_date), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={intern.certificate_url} target="_blank" rel="noopener noreferrer">View Certificate</a>
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
