"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea";
import { Building2, Mail, Phone, MapPin, Users, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react"

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
        setLoading(true)
        setError("")

        try {
            const supabase = createClient()

            // 1. Sign up the owner as a user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.ownerEmail,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.ownerFullName,
                        role: 'member' // Facility owners are members with a special institutional category (handled in migration later)
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("Failed to create user account")

            // 2. Create the profile (Supabase triggers usually handle this, but we'll ensure it)
            // Note: In our current setup, we need to make sure the profile exists

            // 3. Create the facility record
            const { error: facilityError } = await supabase
                .from('facilities')
                .insert({
                    name: formData.facilityName,
                    registration_number: formData.regNumber,
                    tin: formData.tin,
                    facility_type: formData.facilityType,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    state: formData.state,
                    city: formData.city,
                    capacity: parseInt(formData.capacity) || 0,
                    owner_id: authData.user.id,
                    status: 'pending' // Requires NIC approval
                })

            if (facilityError) throw facilityError

            setSuccess(true)
            // In a real app, redirect after success
            // setTimeout(() => router.push('/login'), 3000)
        } catch (err: any) {
            console.error("Facility registration error:", err)
            setError(err.message || "An unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
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

                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? "Submitting Application..." : "Register Facility & Create Profile"}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground mt-4 italic">
                            By clicking register, you agree to NIC's institutional terms and conditions.
                            NIC reserves the right to verify all provided information before certification.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
