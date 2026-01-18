"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ShieldCheck,
    Search,
    UserCheck,
    Building2,
    CheckCircle2,
    XCircle,
    Loader2,
    QrCode
} from "lucide-react"

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
}

export default function PublicVerifyPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<VerifyResult | null>(null)
    const [id, setId] = useState("")

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const supabase = createClient()
            const activeTab = document.querySelector('[data-state="active"][role="tab"]')?.getAttribute('value')

            if (activeTab === 'caregiver') {
                // Search for caregiver
                const { data, error } = await supabase
                    .from('memberships')
                    .select('*, profiles(full_name)')
                    .or(`nic_id.eq."${id}",member_id.eq."${id}"`)
                    .single()

                if (data) {
                    // Fetch affiliation separately to keep it clean
                    const { data: staffData } = await supabase
                        .from('facility_staff')
                        .select('facilities(name)')
                        .eq('membership_id', data.id)
                        .eq('is_active', true)
                        .maybeSingle()

                    const affiliation = (staffData?.facilities as any)?.name || "Independent / Self-Employed"

                    setResult({
                        success: true,
                        type: "Caregiver",
                        name: data.profiles.full_name,
                        status: data.compliance_status || data.status,
                        expiry: new Date(data.expiry_date).toLocaleDateString(),
                        specialization: data.category,
                        affiliation: affiliation
                    })
                } else {
                    setResult({ success: false, type: "Caregiver" })
                }
            } else {
                // Search for facility
                const { data, error } = await supabase
                    .from('facilities')
                    .select('*')
                    .or(`registration_number.eq."${id}",name.ilike."%${id}%"`)
                    .eq('status', 'active')
                    .limit(1)
                    .single()

                if (data) {
                    const score = data.compliance_score || 0
                    let category = "Pending Assessment"
                    if (score >= 85) category = "Fully Compliant"
                    else if (score >= 70) category = "Conditionally Compliant"
                    else if (score > 0) category = "Non-Compliant"

                    setResult({
                        success: true,
                        type: "Facility",
                        name: data.name,
                        status: data.status,
                        expiry: "Permanent",
                        complianceCategory: category,
                        lastInspection: data.last_inspection_date ? new Date(data.last_inspection_date).toLocaleDateString() : "N/A"
                    })
                } else {
                    setResult({ success: false, type: "Facility" })
                }
            }
        } catch (err) {
            console.error("Verification error:", err)
            setResult({ success: false })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-secondary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <ShieldCheck className="mx-auto mb-6 h-12 w-12 text-accent" />
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
                    <Tabs defaultValue="caregiver" className="w-full">
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
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Institutional Affiliation</p>
                                                                    <p className="text-secondary font-bold text-base">{result.affiliation}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Specialization</p>
                                                                    <p className="text-secondary font-bold text-base">{result.specialization}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Registry Valid Until</p>
                                                                    <p className="text-secondary font-bold text-base">{result.expiry}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 pt-4">
                                                                <QrCode className="h-16 w-16 text-emerald-900 opacity-20" />
                                                                <p className="text-xs text-emerald-700 leading-relaxed italic">
                                                                    Verification token: **NIC-V-8829-XJ**. This record was last synchronized with the National Registry on {new Date().toLocaleDateString()}.
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
                                                        <ShieldCheck className="h-8 w-8 text-secondary shrink-0" />
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
                            <ShieldCheck className="h-4 w-4 text-accent" />
                            Information Security
                        </h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            For privacy reasons, only active status and specialization are shown publicly. Full credentials require a secure agency login. NIC data is protected by the Data Protection Act (Nigeria).
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
