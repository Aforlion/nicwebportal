"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    UserPlus,
    FileText,
    CreditCard,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const PaystackPaymentHandler = dynamic(() => import("@/components/paystack-payment-handler"), { ssr: false })
import { savePendingRegistrationAction } from "@/lib/actions/registration"

const MEMBERSHIP_CATEGORIES = [
    { id: "student", name: "Student Member", fee: 5000, description: "For enrolled students" },
    { id: "associate", name: "Associate Member", fee: 25000, description: "Less than 3 years experience" },
    { id: "full", name: "Professional Member (MNIC)", fee: 50000, description: "3+ years experience" },
]

const STEPS = [
    { id: 1, name: "Category", icon: UserPlus },
    { id: 2, name: "Your Details", icon: FileText },
    { id: 3, name: "Payment", icon: CreditCard },
]

export function MemberRegistrationForm({
    lockCategory,
    isGraduate,
    redirectUrl
}: {
    lockCategory?: string,
    isGraduate?: boolean,
    redirectUrl?: string
}) {
    const [currentStep, setCurrentStep] = useState(lockCategory ? 2 : 1)
    const [formData, setFormData] = useState({
        category: lockCategory || "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.fullName || formData.fullName.trim().length < 2)
            newErrors.fullName = "Full name is required"
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "A valid email address is required"
        if (!formData.phone || formData.phone.replace(/\D/g, "").length < 10)
            newErrors.phone = "A valid phone number is required (at least 10 digits)"
        if (!formData.password || formData.password.length < 8)
            newErrors.password = "Password must be at least 8 characters"
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (currentStep === 2 && !validateStep2()) return
        if (currentStep < STEPS.length) setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setErrors({})
            setCurrentStep(currentStep - 1)
        }
    }

    const selectedCategory = MEMBERSHIP_CATEGORIES.find(cat => cat.id === formData.category)

    const updateField = (key: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }))
    }

    return (
        <div className="w-full">
            {redirectUrl?.includes('/enroll') && (
                <div className="mb-8 rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-800 flex gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
                    <div>
                        <p className="font-bold">Prerequisite Membership Required</p>
                        <p className="text-sm">You are completing your prerequisite membership registration. After payment, you will be automatically redirected to complete your course enrollment.</p>
                    </div>
                </div>
            )}

            {/* Progress Steps */}
            <div className="mb-12">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex flex-1 items-center">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${currentStep >= step.id
                                    ? "border-primary bg-primary text-white"
                                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                                    }`}>
                                    {currentStep > step.id ? (
                                        <CheckCircle2 className="h-6 w-6" />
                                    ) : (
                                        <step.icon className="h-6 w-6" />
                                    )}
                                </div>
                                <span className={`mt-2 text-sm font-medium ${currentStep >= step.id ? "text-secondary" : "text-muted-foreground"
                                    }`}>
                                    {step.name}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 transition-colors ${currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {currentStep === 1 && "Select Membership Category"}
                        {currentStep === 2 && (isGraduate ? "Graduate Student Onboarding" : "Your Details")}
                        {currentStep === 3 && "Payment & Confirmation"}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Choose the membership category that best fits your professional status"}
                        {currentStep === 2 && "Just the basics — you can complete your full profile after registration"}
                        {currentStep === 3 && "Complete payment to activate your membership and access orientation"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Step 1: Category Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            {MEMBERSHIP_CATEGORIES.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => updateField("category", category.id)}
                                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary ${formData.category === category.id
                                        ? "border-primary bg-primary/5"
                                        : "border-muted"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-secondary">{category.name}</h3>
                                            <p className="text-sm text-muted-foreground">{category.description}</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                                            ₦{category.fee.toLocaleString()}/year
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Minimal Personal Information */}
                    {currentStep === 2 && (
                        <div className="grid gap-5 md:grid-cols-2">
                            {/* Profile completion nudge */}
                            <div className="md:col-span-2 rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2 text-amber-800 text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>Fields marked <strong>*</strong> are required. You can add your address, photo, and documents after registration from your dashboard.</p>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={(e) => updateField("fullName", e.target.value)}
                                    className={errors.fullName ? "border-red-500" : ""}
                                />
                                {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+234 xxx xxx xxxx"
                                    value={formData.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    className={errors.phone ? "border-red-500" : ""}
                                />
                                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Create Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={formData.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    className={errors.password ? "border-red-500" : ""}
                                />
                                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                                    className={errors.confirmPassword ? "border-red-500" : ""}
                                />
                                {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="rounded-lg border bg-muted/30 p-6">
                                <h3 className="mb-4 font-bold text-secondary">Registration Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Membership Category:</span>
                                        <span className="font-medium">{selectedCategory?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Full Name:</span>
                                        <span className="font-medium">{formData.fullName || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{formData.email || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span className="font-medium">{formData.phone || "—"}</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-bold text-secondary">Annual Fee:</span>
                                            <span className="font-bold text-primary">₦{selectedCategory?.fee.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-2 text-amber-800 text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>After payment, you will receive a welcome email with instructions to complete your profile (address, photo, and documents).</p>
                            </div>
                            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                                <p className="text-sm text-muted-foreground">
                                    By proceeding to payment, you agree to the NIC membership terms and conditions. Your application will be reviewed within 3-5 business days.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === (lockCategory ? 2 : 1)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        {currentStep < STEPS.length ? (
                            <Button
                                onClick={handleNext}
                                disabled={currentStep === 1 && !formData.category}
                                className="bg-primary"
                            >
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <PaystackPaymentHandler
                                email={formData.email}
                                amount={selectedCategory?.fee || 0}
                                useRedirect={true}
                                callbackUrl={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : '')}/payment/callback${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                                onBefore={async () => {
                                    const res = await savePendingRegistrationAction({
                                        email: formData.email,
                                        formData: formData,
                                        registrationType: 'individual'
                                    })
                                    if (res.success) {
                                        return { success: true, metadata: { pending_id: res.id } }
                                    }
                                    return { success: false, error: res.error }
                                }}
                                metadata={{
                                    registration_type: 'individual',
                                    category: formData.category,
                                    full_name: formData.fullName,
                                    phone: formData.phone
                                }}
                                buttonText={`Pay ₦${(selectedCategory?.fee || 0).toLocaleString()} & Register`}
                                showIcon={true}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
