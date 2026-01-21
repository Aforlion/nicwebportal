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
    Upload
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const PaystackPaymentHandler = dynamic(() => import("@/components/paystack-payment-handler"), { ssr: false })
import { savePendingRegistrationAction } from "@/lib/actions/registration"

const MEMBERSHIP_CATEGORIES = [
    { id: "student", name: "Student Member", fee: 5000, description: "For enrolled students" },
    { id: "associate", name: "Associate Member", fee: 15000, description: "Less than 3 years experience" },
    { id: "full", name: "Full Member (MNIC)", fee: 25000, description: "3+ years experience" },
    { id: "trainer", name: "Trainer Member", fee: 40000, description: "Qualified trainers" },
    { id: "institutional", name: "Institutional Member", fee: 100000, description: "Care facilities" },
]

const STEPS = [
    { id: 1, name: "Category", icon: UserPlus },
    { id: 2, name: "Personal Info", icon: FileText },
    { id: 3, name: "Documents", icon: Upload },
    { id: 4, name: "Payment", icon: CreditCard },
]

export function MemberRegistrationForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        category: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        qualification: "",
        experience: "",
    })

    const [files, setFiles] = useState<{
        passport: File | null;
        certificate: File | null;
        idCard: File | null;
    }>({
        passport: null,
        certificate: null,
        idCard: null,
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
        const selectedFile = e.target.files?.[0] || null
        setFiles(prev => ({ ...prev, [key]: selectedFile }))
    }

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const selectedCategory = MEMBERSHIP_CATEGORIES.find(cat => cat.id === formData.category)

    return (
        <div className="mx-auto max-w-4xl">
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
                        {currentStep === 2 && "Personal Information"}
                        {currentStep === 3 && "Upload Documents"}
                        {currentStep === 4 && "Payment & Confirmation"}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Choose the membership category that best fits your professional status"}
                        {currentStep === 2 && "Provide your personal and professional details"}
                        {currentStep === 3 && "Upload required documents for verification"}
                        {currentStep === 4 && "Complete payment to activate your membership"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1: Category Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            {MEMBERSHIP_CATEGORIES.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => setFormData({ ...formData, category: category.id })}
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

                    {/* Step 2: Personal Information */}
                    {currentStep === 2 && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+234 xxx xxx xxxx"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    placeholder="Your residential address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qualification">Highest Qualification *</Label>
                                <Input
                                    id="qualification"
                                    placeholder="e.g., HCA Certificate, BSc Nursing"
                                    value={formData.qualification}
                                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Years of Experience</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    placeholder="0"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Documents */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Passport Photograph *</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className={`w-8 h-8 mb-2 ${files.passport ? "text-primary" : "text-muted-foreground"}`} />
                                            <p className="text-sm text-muted-foreground">
                                                {files.passport ? (
                                                    <span className="text-primary font-medium">Selected: {files.passport.name}</span>
                                                ) : (
                                                    "Click to upload passport photo"
                                                )}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'passport')}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Professional Certificate *</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className={`w-8 h-8 mb-2 ${files.certificate ? "text-primary" : "text-muted-foreground"}`} />
                                            <p className="text-sm text-muted-foreground">
                                                {files.certificate ? (
                                                    <span className="text-primary font-medium">Selected: {files.certificate.name}</span>
                                                ) : (
                                                    "Upload HCA or relevant certificate"
                                                )}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileChange(e, 'certificate')}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Valid ID Card *</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className={`w-8 h-8 mb-2 ${files.idCard ? "text-primary" : "text-muted-foreground"}`} />
                                            <p className="text-sm text-muted-foreground">
                                                {files.idCard ? (
                                                    <span className="text-primary font-medium">Selected: {files.idCard.name}</span>
                                                ) : (
                                                    "Upload National ID, Driver's License, or Passport"
                                                )}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileChange(e, 'idCard')}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Payment */}
                    {currentStep === 4 && (
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
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-bold text-secondary">Annual Fee:</span>
                                            <span className="font-bold text-primary">₦{selectedCategory?.fee.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
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
                            disabled={currentStep === 1}
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
                                callbackUrl={`${window.location.origin}/payment/callback`}
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

