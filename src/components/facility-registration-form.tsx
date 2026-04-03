"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendFacilityRegistrationEmailAction, registerFacilityAction } from "@/lib/actions/registration"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea"
import { Building2, Mail, Phone, MapPin, Users, ShieldCheck, CheckCircle2, AlertCircle, CreditCard } from "lucide-react"
import dynamic from "next/dynamic"

const PaystackPaymentHandler = dynamic(() => import("@/components/paystack-payment-handler"), { ssr: false })
import { savePendingRegistrationAction } from "@/lib/actions/registration"
import { env } from "@/env"

const REGISTRATION_FEE = 100000

const FACILITY_TYPES = [
    { value: "nursing_home", label: "Nursing Home" },
    { value: "hospital", label: "Hospital / Medical Center" },
    { value: "agency", label: "Care Agency" },
    { value: "rehab", label: "Rehabilitation Center" },
    { value: "home_care", label: "In-Home Care Provider" },
]

export function FacilityRegistrationForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [baseUrl, setBaseUrl] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            const host = window.location.host
            const protocol = host.includes('localhost') ? 'http' : 'https'
            setBaseUrl(`${protocol}://${host}`)
        }
    }, [])

    const [formData, setFormData] = useState({
        facilityName: "",
        regNumber: "",
        tin: "",
        facilityType: "nursing_home",
        email: "",
        phone: "",
        address: "",
        state: "",
        city: "",
        capacity: "",
        ownerFullName: "",
        ownerEmail: "",
        password: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // No longer used for direct submission - Paystack handler takes over
    }

    if (success) {
        return (
            <Card className="mx-auto max-w-2xl border-emerald-100 bg-emerald-50/30">
                <CardContent className="pt-12 pb-12 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <CardTitle className="mb-4 text-3xl text-emerald-900">Application Received!</CardTitle>
                    <CardDescription className="text-lg text-emerald-700">
                        The registration for <strong>{formData.facilityName}</strong> has been submitted to the NIC Registry Dept.
                        We will review your documents and contact you within 3-5 business days.
                    </CardDescription>
                    <div className="mt-8">
                        <Button color="primary" onClick={() => router.push('/')}>
                            Return to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-auto max-w-4xl shadow-xl">
            <CardHeader className="bg-primary text-white rounded-t-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-6 w-6" />
                    <CardTitle>Institutional Membership Registration</CardTitle>
                </div>
                <CardDescription className="text-primary-foreground/80">
                    Register your facility as a certified NIC Care Partner.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Section 1: Facility Details */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold flex items-center gap-2 text-primary border-b pb-2">
                            <Building2 className="h-5 w-5" />
                            Facility Information
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="facilityName">Full Registered Name</Label>
                                <Input
                                    id="facilityName"
                                    name="facilityName"
                                    placeholder="e.g., Sunshine Nursing Home Ltd"
                                    value={formData.facilityName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="regNumber">CAC Registration Number (RC/BN)</Label>
                                <Input
                                    id="regNumber"
                                    name="regNumber"
                                    placeholder="e.g., RC 1234567"
                                    value={formData.regNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                                <Input
                                    id="tin"
                                    name="tin"
                                    placeholder="e.g., 12345678-0001"
                                    value={formData.tin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facilityType">Facility Type</Label>
                                <select
                                    id="facilityType"
                                    name="facilityType"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.facilityType}
                                    onChange={handleChange}
                                >
                                    {FACILITY_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Patient/Resident Capacity</Label>
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    placeholder="e.g., 50"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contact Details */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold flex items-center gap-2 text-primary border-b pb-2">
                            <MapPin className="h-5 w-5" />
                            Contact & Location
                        </h3>
                        <div className="space-y-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Official Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            className="pl-10"
                                            placeholder="info@facility.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Official Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            className="pl-10"
                                            placeholder="+234 ..."
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Full Office Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter physical location..."
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="min-h-[80px]"
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        placeholder="e.g., Lagos"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        placeholder="e.g., Ikeja"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Authorized Representative */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold flex items-center gap-2 text-primary border-b pb-2">
                            <ShieldCheck className="h-5 w-5" />
                            Authorized Representative Account
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This person will manage the facility's profile and staff links.
                        </p>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="ownerFullName">Full Name</Label>
                                <Input
                                    id="ownerFullName"
                                    name="ownerFullName"
                                    placeholder="e.g., Dr. Olumide James"
                                    value={formData.ownerFullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ownerEmail">Login Email</Label>
                                <Input
                                    id="ownerEmail"
                                    name="ownerEmail"
                                    type="email"
                                    placeholder="personal@email.com"
                                    value={formData.ownerEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="password">Login Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Choose a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Payment Summary */}
                    <div className="pt-6 border-t">
                        <h3 className="mb-4 text-lg font-bold flex items-center gap-2 text-primary">
                            <CreditCard className="h-5 w-5" />
                            Registration Fee
                        </h3>
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-secondary font-medium">Institutional Registration Fee</span>
                                <span className="text-2xl font-extrabold text-primary">₦{REGISTRATION_FEE.toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This is a mandatory one-time registration fee for care facilities to be listed on the National Caregiver Registry.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <PaystackPaymentHandler
                            email={formData.ownerEmail}
                            amount={REGISTRATION_FEE}
                            useRedirect={true}
                            callbackUrl={env.NEXT_PUBLIC_APP_URL ? `${env.NEXT_PUBLIC_APP_URL}/payment/callback` : (baseUrl ? `${baseUrl}/payment/callback` : undefined)}
                            onBefore={async () => {
                                // Basic validation before Paystack
                                if (!formData.facilityName || !formData.ownerEmail || !formData.password) {
                                    setError("Please fill in all required fields including password.")
                                    return { success: false, error: "Missing fields" }
                                }

                                const res = await savePendingRegistrationAction({
                                    email: formData.ownerEmail,
                                    formData: formData,
                                    registrationType: 'facility'
                                })
                                if (res.success) {
                                    return { success: true, metadata: { pending_id: res.id, registration_type: 'facility' } }
                                }
                                setError(res.error || "Failed to save registration data")
                                return { success: false, error: res.error }
                            }}
                            buttonText={`Pay ₦${REGISTRATION_FEE.toLocaleString()} & Submit Application`}
                            className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                            showIcon={true}
                        />
                        <p className="text-center text-xs text-muted-foreground mt-4 italic">
                            Secure payment provided by Paystack. By clicking pay, you agree to NIC's institutional terms and conditions.
                            NIC reserves the right to verify all provided information before certification.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
