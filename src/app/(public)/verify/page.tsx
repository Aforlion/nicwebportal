"use client"

import { useState } from "react"
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

export default function PublicVerifyPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<Record<string, unknown> | null>(null)
    const [id, setId] = useState("")

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock result for demonstration
        if (id.toUpperCase() === "NIC-MEM-5502") {
            setResult({
                success: true,
                type: "Caregiver",
                name: "Grace Obi",
                status: "Active / Licensed",
                expiry: "March 2025",
                specialization: "Dementia Care",
            })
        } else {
            setResult({ success: false })
        }
        setLoading(false)
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
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Status</p>
                                                                    <p className="text-emerald-600 font-bold text-base">{result.status}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Specialization</p>
                                                                    <p className="text-secondary font-bold text-base">{result.specialization}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                                    <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">Expiry Date</p>
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
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Facility verification index is currently being migrated.</p>
                                    <p className="text-sm mt-2">Please contact support for official status letters.</p>
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
