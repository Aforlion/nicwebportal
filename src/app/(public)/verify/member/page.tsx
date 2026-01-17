"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Calendar,
    User,
    Award,
    FileText,
    AlertCircle,
    QrCode
} from "lucide-react"

type SearchType = "id" | "name" | "certificate"

export default function VerifyMemberPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchType, setSearchType] = useState<SearchType>("id")
    const [verificationResult, setVerificationResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSearch = async () => {
        setLoading(true)
        setError("")
        setVerificationResult(null)

        try {
            const supabase = createClient()

            // Log the verification attempt
            await supabase.from('verification_logs').insert({
                search_type: searchType,
                search_query: searchQuery,
                result_found: false // Will update if found
            })

            let query = supabase
                .from('memberships')
                .select(`
                    *,
                    profiles!inner(full_name, email),
                    caregiver_certifications(certificate_number, certificate_name, certificate_type, is_valid, expiry_date)
                `)

            // Search based on type
            if (searchType === "id") {
                query = query.or(`nic_id.eq.${searchQuery},member_id.eq.${searchQuery}`)
            } else if (searchType === "name") {
                query = query.ilike('profiles.full_name', `%${searchQuery}%`)
            } else if (searchType === "certificate") {
                query = query.eq('caregiver_certifications.certificate_number', searchQuery)
            }

            const { data, error: queryError } = await query.single()

            if (queryError) {
                if (queryError.code === 'PGRST116') {
                    setError("No member found with the provided information")
                } else {
                    throw queryError
                }
                return
            }

            setVerificationResult(data)

            // Update log with success
            await supabase.from('verification_logs').insert({
                search_type: searchType,
                search_query: searchQuery,
                result_found: true,
                result_id: data.id
            })

        } catch (err: any) {
            setError(err.message || "An error occurred during verification")
        } finally {
            setLoading(false)
        }
    }

    const getComplianceStatusColor = (status: string) => {
        switch (status) {
            case 'compliant':
            case 'active':
                return 'bg-emerald-500'
            case 'under_review':
                return 'bg-yellow-500'
            case 'suspended':
                return 'bg-orange-500'
            case 'revoked':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <ShieldCheck className="mx-auto mb-6 h-16 w-16 text-accent" />
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        National Caregiver Registry
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Verify the professional status and credentials of NIC-certified caregivers
                    </p>
                </div>
            </section>

            {/* Search Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Verify a Caregiver</CardTitle>
                            <CardDescription>
                                Search by Member ID, Name, or Certificate Number to verify professional status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Search Type Selector */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={searchType === "id" ? "default" : "outline"}
                                    onClick={() => setSearchType("id")}
                                    className={searchType === "id" ? "bg-primary" : ""}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Member ID
                                </Button>
                                <Button
                                    variant={searchType === "name" ? "default" : "outline"}
                                    onClick={() => setSearchType("name")}
                                    className={searchType === "name" ? "bg-primary" : ""}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Name
                                </Button>
                                <Button
                                    variant={searchType === "certificate" ? "default" : "outline"}
                                    onClick={() => setSearchType("certificate")}
                                    className={searchType === "certificate" ? "bg-primary" : ""}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Certificate Number
                                </Button>
                            </div>

                            {/* Search Input */}
                            <div className="space-y-2">
                                <label htmlFor="search" className="text-sm font-medium">
                                    {searchType === "id" && "Member ID"}
                                    {searchType === "name" && "Full Name"}
                                    {searchType === "certificate" && "Certificate Number"}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        id="search"
                                        placeholder={
                                            searchType === "id" ? "e.g., NIC-MEM-5502" :
                                                searchType === "name" ? "e.g., Grace Obi" :
                                                    "e.g., CERT-123456"
                                        }
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1"
                                        disabled={loading}
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        className="bg-primary"
                                        disabled={loading || !searchQuery}
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        {loading ? "Verifying..." : "Verify"}
                                    </Button>
                                </div>
                            </div>

                            {/* Info Notice */}
                            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                                <p className="flex items-start gap-2">
                                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                                    <span>
                                        This verification tool is provided for employers, families, and the public to confirm
                                        the professional credentials of NIC-certified caregivers.
                                    </span>
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-destructive">Verification Failed</p>
                                        <p className="text-sm text-destructive/80">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Verification Result */}
                            {verificationResult && (
                                <div className="space-y-6 pt-6 border-t">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-secondary">Caregiver Verified</h3>
                                            <p className="text-sm text-muted-foreground">Professional credentials confirmed</p>
                                        </div>
                                    </div>

                                    <Card className="bg-muted/30">
                                        <CardContent className="p-6 space-y-4">
                                            {/* Member Info */}
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                                    <p className="font-medium text-secondary">{verificationResult.profiles?.full_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Member ID</p>
                                                    <p className="font-medium">{verificationResult.nic_id || verificationResult.member_id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Category</p>
                                                    <Badge variant="secondary">{verificationResult.category}</Badge>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Status</p>
                                                    <Badge className={getComplianceStatusColor(verificationResult.compliance_status || verificationResult.status)}>
                                                        {verificationResult.compliance_status || verificationResult.status}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Member Since</p>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(verificationResult.joined_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Valid Until</p>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(verificationResult.expiry_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Certifications */}
                                            {verificationResult.caregiver_certifications && verificationResult.caregiver_certifications.length > 0 && (
                                                <div className="pt-4 border-t">
                                                    <p className="text-sm font-medium text-muted-foreground mb-3">Certifications</p>
                                                    <div className="space-y-2">
                                                        {verificationResult.caregiver_certifications.map((cert: any, index: number) => (
                                                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background">
                                                                <div className="flex items-center gap-3">
                                                                    <Award className="h-5 w-5 text-primary" />
                                                                    <div>
                                                                        <p className="font-medium text-sm">{cert.certificate_name}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {cert.certificate_type} • {cert.certificate_number}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {cert.is_valid ? (
                                                                    <Badge className="bg-emerald-500">Valid</Badge>
                                                                ) : (
                                                                    <Badge variant="destructive">Expired</Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* CPD Compliance */}
                                            {verificationResult.cpd_compliant !== undefined && (
                                                <div className="pt-4 border-t">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">CPD Compliance</span>
                                                        {verificationResult.cpd_compliant ? (
                                                            <Badge className="bg-emerald-500">
                                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                Compliant
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive">
                                                                <XCircle className="mr-1 h-3 w-3" />
                                                                Non-Compliant
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Security Notice */}
                                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                                        <p className="text-sm text-muted-foreground">
                                            <strong className="text-primary">Security Notice:</strong> This verification confirms that the individual
                                            is a registered member of the National Institute of Caregivers. For additional verification or to report
                                            concerns, please contact NIC directly.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* QR Code Scanner Info */}
                    <Card className="mt-8">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <QrCode className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-secondary mb-2">Scan QR Code</h3>
                                    <p className="text-sm text-muted-foreground">
                                        NIC members carry digital ID cards with QR codes. Scan the QR code on their ID card
                                        for instant verification.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
