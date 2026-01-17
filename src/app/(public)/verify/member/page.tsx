"use client"

import { useState } from "react"
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
    Award
} from "lucide-react"

export default function VerifyMemberPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchType, setSearchType] = useState<"id" | "name">("id")
    const [verificationResult, setVerificationResult] = useState<any>(null)

    const handleSearch = () => {
        // Mock verification result
        setVerificationResult({
            found: true,
            memberID: "NIC-MEM-5502",
            fullName: "Grace Obi",
            category: "Full Member (MNIC)",
            status: "Active",
            joinedDate: "March 2024",
            expiryDate: "March 30, 2025",
            photoUrl: null,
            certifications: ["HCA Certificate", "Dementia Care Specialist"]
        })
    }

    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <ShieldCheck className="mx-auto mb-6 h-16 w-16 text-accent" />
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Verify NIC Member
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Confirm the professional status and credentials of NIC-certified caregivers
                    </p>
                </div>
            </section>

            {/* Search Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Search for a Member</CardTitle>
                            <CardDescription>
                                Enter a member ID or full name to verify their professional status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4">
                                <Button
                                    variant={searchType === "id" ? "default" : "outline"}
                                    onClick={() => setSearchType("id")}
                                    className={searchType === "id" ? "bg-primary" : ""}
                                >
                                    Search by ID
                                </Button>
                                <Button
                                    variant={searchType === "name" ? "default" : "outline"}
                                    onClick={() => setSearchType("name")}
                                    className={searchType === "name" ? "bg-primary" : ""}
                                >
                                    Search by Name
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {searchType === "id" ? "Member ID" : "Full Name"}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        id="search"
                                        placeholder={searchType === "id" ? "e.g., NIC-MEM-5502" : "e.g., Grace Obi"}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSearch} className="bg-primary">
                                        <Search className="mr-2 h-4 w-4" />
                                        Verify
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                                <p>
                                    <strong>Note:</strong> This verification tool is for public use. Employers and care facilities can verify the professional status of NIC-certified caregivers before hiring.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Result */}
                    {verificationResult && (
                        <Card className="mt-8">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Verification Result</CardTitle>
                                    {verificationResult.found ? (
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                            <CheckCircle2 className="mr-1 h-4 w-4" />
                                            Verified Member
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-500 hover:bg-red-600">
                                            <XCircle className="mr-1 h-4 w-4" />
                                            Not Found
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {verificationResult.found ? (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-6">
                                            <div className="h-24 w-24 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-3xl flex-shrink-0">
                                                GO
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">
                                                            <User className="inline h-4 w-4 mr-1" />
                                                            Full Name
                                                        </p>
                                                        <p className="font-bold text-secondary">{verificationResult.fullName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Member ID</p>
                                                        <p className="font-mono font-bold text-primary">{verificationResult.memberID}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Category</p>
                                                        <p className="font-medium">{verificationResult.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                                            {verificationResult.status}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">
                                                            <Calendar className="inline h-4 w-4 mr-1" />
                                                            Member Since
                                                        </p>
                                                        <p className="font-medium">{verificationResult.joinedDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Expiry Date</p>
                                                        <p className="font-medium">{verificationResult.expiryDate}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        <Award className="inline h-4 w-4 mr-1" />
                                                        Certifications
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {verificationResult.certifications.map((cert: string, index: number) => (
                                                            <Badge key={index} variant="outline">
                                                                {cert}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                                            <div className="flex gap-3">
                                                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-emerald-900">Verified Professional</p>
                                                    <p className="text-emerald-700">
                                                        This individual is a registered member of the National Institute of Caregivers (NIC) in good standing. Their credentials have been verified and they are authorized to practice as a professional caregiver in Nigeria.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                                        <h3 className="text-xl font-bold text-secondary mb-2">Member Not Found</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto">
                                            The member ID or name you entered could not be found in our database. Please check the details and try again.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    )
}
