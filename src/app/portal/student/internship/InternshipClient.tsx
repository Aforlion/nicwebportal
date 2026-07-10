'use client'

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Clock, MapPin } from "lucide-react"
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

interface InternshipClientProps {
    initialInternships: Internship[]
}

export default function InternshipClient({ initialInternships }: InternshipClientProps) {
    const [internships, setInternships] = useState<Internship[]>(initialInternships)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [facilityName, setFacilityName] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

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

        // Validate duration is at least 3 months (90 days roughly)
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

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('member-documents')
                .upload(storagePath, selectedFile, { upsert: false })

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('member-documents')
                .getPublicUrl(storagePath)

            // 3. Save to database
            const res = await saveInternshipRecord({
                startDate,
                endDate,
                certificateUrl: publicUrl,
                customFacilityName: facilityName
            })

            if (res.success) {
                toast.success("Internship certificate uploaded successfully! Awaiting admin review.")
                // Add to list locally
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
                // Reset form
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
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Internship Placement</h1>
                <p className="text-muted-foreground">Submit and track your mandatory 3-month clinical internship certificate for NCNA licensing.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Upload Form */}
                <Card className="md:col-span-2 border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Submit Internship Certificate</CardTitle>
                        <CardDescription>Enter placement dates and upload your verified completion certificate.</CardDescription>
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
                                    placeholder="e.g. St. Nicholas Hospital, Lagos"
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
                                ) : "Submit for Verification"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Requirements Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border border-primary/10 rounded-2xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">NCNA Pathway Checklist</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs text-secondary">
                            <div className="flex gap-2.5 items-start">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Fundamental Course</p>
                                    <p className="text-muted-foreground">Complete level 1 or 2 caregiver modules.</p>
                                </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Advanced Course</p>
                                    <p className="text-muted-foreground">Complete one level 3 or 4 specialty track.</p>
                                </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">3-Month Internship</p>
                                    <p className="text-muted-foreground">Upload your completion certificate from a clinical care partner.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* History Table */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Placement History</CardTitle>
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
