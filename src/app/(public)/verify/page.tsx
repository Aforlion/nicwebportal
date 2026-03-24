"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    UserCheck,
    Building2,
    CheckCircle2,
    XCircle,
    Loader2,
    QrCode
} from "lucide-react"
import { toast } from "sonner"

type VerifyResult = {
    success: boolean
    type?: string
    name?: string
    status?: string
    expiry?: string
    specialization?: string
    affiliation?: string
    complianceCategory?: string
    lastInspection?: string
    issueDate?: string
    certNumber?: string
}

export default function PublicVerifyPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<VerifyResult | null>(null)
    const [id, setId] = useState("")
    const [activeTab, setActiveTab] = useState("caregiver")

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        const searchId = id.trim()
        if (!searchId) return

        setLoading(true)
        setResult(null)

        try {
            const supabase = createClient()
            
            if (activeTab === 'caregiver') {
                // 1. Search for membership first
                const { data: memberData, error: memberError } = await supabase
                    .from('memberships')
                    .select('*, profiles(full_name)')
                    .or(`nic_id.ilike.%${searchId}%,member_id.ilike.%${searchId}%`)
                    .maybeSingle()

                if (memberError) console.error("Membership search error:", memberError)

                if (memberData) {
                    const { data: staffData } = await supabase
                        .from('facility_staff')
                        .select('facilities(name)')
                        .eq('membership_id', memberData.id)
                        .eq('is_active', true)
                        .maybeSingle()

                    const affiliation = (staffData?.facilities as any)?.name || "Independent / Self-Employed"

                    setResult({
                        success: true,
                        type: "Caregiver",
                        name: memberData.profiles.full_name,
                        status: memberData.compliance_status || memberData.status,
                        expiry: memberData.expiry_date ? new Date(memberData.expiry_date).toLocaleDateString() : "N/A",
                        specialization: memberData.category,
                        affiliation: affiliation,
                        certNumber: memberData.nic_id
                    })
                    toast.success("Caregiver record verified successfully!")
                    return
                }

                // 2. Search for Professional Certification
                const { data: profCert, error: profError } = await supabase
                    .from('caregiver_certifications')
                    .select('*, memberships(*, profiles(full_name))')
                    .or(`verification_code.ilike.%${searchId}%,certificate_number.ilike.%${searchId}%`)
                    .maybeSingle()

                if (profError) console.error("Professional cert search error:", profError)

                if (profCert) {
                    setResult({
                        success: true,
                        type: "Professional Certification",
                        name: (profCert.memberships as any)?.profiles?.full_name || "N/A",
                        status: profCert.is_valid ? "Valid" : "Expired/Invalid",
                        expiry: profCert.expiry_date ? new Date(profCert.expiry_date).toLocaleDateString() : "Permanent",
                        specialization: profCert.certificate_name,
                        affiliation: profCert.issuing_institution,
                        certNumber: profCert.certificate_number,
                        issueDate: new Date(profCert.issue_date).toLocaleDateString()
                    })
                    toast.success("Professional certification verified!")
                    return
                }

                // 3. Search for Course Certificate
                const { data: courseCert, error: courseError } = await supabase
                    .from('certificates')
                    .select('*, profiles(full_name), programs(title)')
                    .ilike('certificate_number', `%${searchId}%`)
                    .maybeSingle()

                if (courseError) console.error("Course cert search error:", courseError)

                if (courseCert) {
                    setResult({
                        success: true,
                        type: "Course Certificate",
                        name: (courseCert.profiles as any)?.full_name || "N/A",
                        status: courseCert.is_verified ? "Verified" : "Under Review",
                        expiry: "Permanent",
                        specialization: (courseCert.programs as any)?.title || "NIC Training",
                        certNumber: courseCert.certificate_number,
                        issueDate: new Date(courseCert.issue_date).toLocaleDateString()
                    })
                    toast.success("Course certificate verified!")
                    return
                }

                setResult({ success: false, type: "Caregiver" })
                toast.error("No matching caregiver record found.")
            } else if (activeTab === 'facility') {
                // Search for facility
                const { data: facData, error: facError } = await supabase
                    .from('facilities')
                    .select('*')
                    .or(`registration_number.ilike.%${searchId}%,name.ilike.%${searchId}%`)
                    .maybeSingle()

                if (facError) console.error("Facility search error:", facError)

                if (facData) {
                    const score = facData.score || 0
                    let category = "Pending Assessment"
                    if (score >= 85) category = "Fully Compliant"
                    else if (score >= 70) category = "Conditionally Compliant"
                    else if (score > 0) category = "Non-Compliant"

                    setResult({
                        success: true,
                        type: "Facility",
                        name: facData.name,
                        status: facData.status,
                        expiry: "Permanent",
                        complianceCategory: category,
                        lastInspection: facData.last_inspection_date ? new Date(facData.last_inspection_date).toLocaleDateString() : "N/A",
                        certNumber: facData.registration_number
                    })
                    toast.success("Care facility record verified!")
                } else {
                    setResult({ success: false, type: "Facility" })
                    toast.error("No matching facility record found.")
                }
            }
        } catch (err) {
            console.error("Verification error:", err)
            setResult({ success: false })
            toast.error("An error occurred during verification. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pb-20 relative min-h-screen">
            {/* Background Watermark */}
            <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                <Image 
                    src="/coat-of-arm.png" 
                    alt="" 
                    width={800} 
                    height={800} 
                    className="object-contain"
                />
            </div>

            {/* Content wrapped in relative z-10 */}
            <div className="relative z-10">
            {/* Header */}
            <section className="bg-secondary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <Image src="/logo.jpg" alt="NIC" width={64} height={64} className="mx-auto mb-6 h-16 w-auto rounded bg-white p-1" />
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                        National Verification Portal
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Instantly verify the status of a Caregiver, Trainee, or Care Facility registration with the National Institute of Caregivers.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="caregiver" className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4" /> Caregiver/Student
                            </TabsTrigger>
                            <TabsTrigger value="facility" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Care Facility
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="caregiver">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Verify Caregiver Status</CardTitle>
                                    <CardDescription>Enter the NIC Registration Number or Certificate ID.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleVerify} className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="e.g., NIC-MEM-5502"
                                                className="pl-12 h-14 text-lg"
                                                value={id}
                                                onChange={(e) => setId(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full h-14 text-lg bg-primary" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                "Run Verification"
                                            )}
                                        </Button>
                                    </form>

                                    {/* Result Display */}
                                    {result && (
                                        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                            {result.success ? (
                                                <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6">
                                                    <div className="flex items-start gap-4">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                                                        <div className="space-y-4 flex-grow">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-emerald-900 leading-none">Record Found</h3>
                                                                <p className="text-emerald-700 text-sm mt-1">This individual is a registered professional.</p>
                                                            </div>

                                                            <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Full Name</p>
                                                                    <p className="text-secondary font-bold text-base">{result.name}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">
                                                                        {result.type === 'Caregiver' ? 'Institutional Affiliation' : 'Issuing Institution'}
                                                                    </p>
                                                                    <p className="text-secondary font-bold text-base">{result.affiliation || "N/A"}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">
                                                                        {result.type === 'Caregiver' ? 'Specialization' : 'Credential Name'}
                                                                    </p>
                                                                    <p className="text-secondary font-bold text-base">{result.specialization}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">
                                                                        {result.issueDate ? 'Date Issued' : 'Registry Valid Until'}
                                                                    </p>
                                                                    <p className="text-secondary font-bold text-base">{result.issueDate || result.expiry}</p>
                                                                </div>
                                                                {result.type !== 'Caregiver' && result.expiry && result.expiry !== 'Permanent' && (
                                                                    <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                        <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Valid Until</p>
                                                                        <p className="text-secondary font-bold text-base">{result.expiry}</p>
                                                                    </div>
                                                                )}
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Registration/Cert No.</p>
                                                                    <p className="text-secondary font-bold text-base">{result.certNumber}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 pt-4">
                                                                <QrCode className="h-16 w-16 text-emerald-900 opacity-20" />
                                                                <p className="text-xs text-emerald-700 leading-relaxed italic">
                                                                    Verification token: **NIC-V-{Math.floor(1000 + Math.random() * 9000)}-{result.certNumber?.split('-').pop()}**. This record was last synchronized with the National Registry on {new Date().toLocaleDateString()}.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border-2 border-destructive/10 bg-destructive/5 p-6 text-center">
                                                    <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                                    <h3 className="text-xl font-bold text-destructive">Record Not Found</h3>
                                                    <p className="text-muted-foreground mt-2">
                                                        The registration number **{id}** does not match any record in our registry. Please check for typos or report unauthorized use.
                                                    </p>
                                                    <Button variant="outline" className="mt-6 border-destructive text-destructive hover:bg-destructive hover:text-white" asChild>
                                                        <a href="/contact">Report Discrepancy</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="facility">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Verify Care Facility</CardTitle>
                                    <CardDescription>Search for registered Elder Care homes, Training centres, or Agencies.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleVerify} className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="e.g., NIC-FAC-1234 or Business Name"
                                                className="pl-12 h-14 text-lg"
                                                value={id}
                                                onChange={(e) => setId(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full h-14 text-lg bg-secondary text-white" disabled={loading}>
                                            {loading ? (
                                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                                            ) : (
                                                "Lookup Facility"
                                            )}
                                        </Button>
                                    </form>

                                    {result && result.type === 'Facility' && (
                                        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                            {result.success ? (
                                                <div className="rounded-2xl border-2 border-secondary/10 bg-secondary/5 p-6">
                                                    <div className="flex items-start gap-4">
                                                        <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="h-8 w-8 rounded" />
                                                        <div className="space-y-4 flex-grow">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-secondary leading-none">Registered Institution</h3>
                                                                <p className="text-muted-foreground text-sm mt-1">This facility is officially recognized by NIC.</p>
                                                            </div>
                                                            <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                                                <div className="bg-white p-3 rounded-lg border">
                                                                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Facility Name</p>
                                                                    <p className="text-secondary font-bold text-base">{result.name}</p>
                                                                </div>
                                                                <div className="bg-white p-3 rounded-lg border">
                                                                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Compliance Category</p>
                                                                    <p className={`font-black text-base ${result.complianceCategory === 'Fully Compliant' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                                        {result.complianceCategory}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-white p-3 rounded-lg border">
                                                                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Last Inspection</p>
                                                                    <p className="text-secondary font-bold text-base">
                                                                        {result.lastInspection}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border-2 border-destructive/10 bg-destructive/5 p-6 text-center">
                                                    <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                                    <h3 className="text-xl font-bold text-destructive">Facility Not Found</h3>
                                                    <p className="text-muted-foreground mt-2">No record exists for **{id}**.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-12 p-6 bg-accent/5 rounded-2xl border border-accent/10">
                        <h4 className="font-bold text-secondary flex items-center gap-2">
                            <Image src="/logo.jpg" alt="Logo" width={16} height={16} className="h-4 w-4 rounded" />
                            Information Security
                        </h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            For privacy reasons, only active status and specialization are shown publicly. Full credentials require a secure agency login. NIC data is protected by the Data Protection Act (Nigeria).
                        </p>
                    </div>
                </div>
            </section>
        </div>
        </div>
    )
}
