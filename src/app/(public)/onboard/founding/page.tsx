"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    Upload,
    Loader2,
    Lock,
    User,
    ChevronRight,
    AlertCircle
} from "lucide-react"
import { usePaystackPayment } from "react-paystack"
import dynamic from "next/dynamic"

const PaystackPaymentHandler = dynamic(() => import("@/components/paystack-payment-handler"), { ssr: false })
import { toast } from "sonner"

// Note: Paystack keys should be in .env. We'll use a placeholder for now.
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder"

function FoundingOnboardingFlow() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [invitation, setInvitation] = useState<any>(null)
    const [error, setError] = useState("")

    // Form States
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        passport: null,
        idCard: null
    })
    const [uploading, setUploading] = useState(false)
    const [includeRecapitalization, setIncludeRecapitalization] = useState(true)
    const paymentAmount = includeRecapitalization ? 112000 : 12000

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing invitation token.")
            setLoading(false)
            return
        }

        // Recover state from sessionStorage if returning from payment
        const savedPass = sessionStorage.getItem(`founding_pass_${token}`)
        if (savedPass) setPassword(savedPass)

        const queryStep = searchParams.get('step')
        const paid = searchParams.get('paid')
        if (queryStep) setStep(parseInt(queryStep))
        if (paid === 'true') {
            // If already paid, move ahead
            toast.success("Payment confirmed!")
        }

        fetchInvitation()
    }, [token, searchParams])

    const fetchInvitation = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('membership_invitations')
            .select('*')
            .eq('token', token)
            .eq('is_used', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (error || !data) {
            setError("This invitation is invalid, expired, or has already been used.")
        } else {
            setInvitation(data)
            if (data.paid_at) {
                setStep(3)
            }
        }
        setLoading(false)
    }

    const handleAccountSetup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        // Save password temporarily to recover after redirect
        sessionStorage.setItem(`founding_pass_${token}`, password)
        setStep(2) // Move to Payment
    }

    const handlePaymentSuccess = async () => {
        setStep(3) // Move to KYC
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }))
        }
    }

    const handleCompleteKYC = async () => {
        setUploading(true)
        try {
            const supabase = createClient()

            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitation.email,
                password: password,
                options: {
                    data: {
                        full_name: invitation.full_name,
                        role: 'member'
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("Failed to create account")

            // 2. Upload Files (Passport & ID)
            // Note: This assumes a 'kyc' bucket exists in Supabase Storage
            const uploadDocument = async (file: File, prefix: string) => {
                const ext = file.name.split('.').pop()
                const path = `${authData.user!.id}/${prefix}_${Date.now()}.${ext}`
                const { data, error } = await supabase.storage.from('kyc').upload(path, file)
                if (error) throw error
                return supabase.storage.from('kyc').getPublicUrl(path).data.publicUrl
            }

            let passportUrl = ""
            let idUrl = ""

            if (files.passport) passportUrl = await uploadDocument(files.passport, 'passport')
            if (files.idCard) idUrl = await uploadDocument(files.idCard, 'id_card')

            // 3. Update Profile & Create Membership
            await supabase.from('profiles').update({
                passport_url: passportUrl,
                id_card_url: idUrl,
                kyc_status: 'under_review'
            }).eq('id', authData.user.id)

            await supabase.from('memberships').insert({
                user_id: authData.user.id,
                category: invitation.category,
                is_founding: true,
                is_active: true,
                paid_recapitalization: invitation.paid_recapitalization,
                recapitalization_amount: invitation.paid_recapitalization ? 100000 : 0,
                last_payment_reference: invitation.payment_reference,
                last_payment_date: invitation.paid_at,
                expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            })

            // 4. Mark Invitation as Used
            await supabase.from('membership_invitations').update({ is_used: true }).eq('id', invitation.id)

            setStep(4) // Success
        } catch (err: any) {
            toast.error(err.message || "An error occurred during final setup.")
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
                    <CardContent className="pt-6 text-center space-y-4">
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                        <CardTitle className="text-destructive">Invalid Link</CardTitle>
                        <CardDescription>{error}</CardDescription>
                        <Button variant="outline" onClick={() => router.push('/')}>Return Home</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="mb-12 text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-accent mb-4" />
                    <h1 className="text-3xl font-extrabold tracking-tight text-secondary">Founding Member Onboarding</h1>
                    <p className="text-muted-foreground mt-2">Welcome, {invitation?.full_name}. We are honored to have you as a founder.</p>
                </div>

                {/* Steps Indicator */}
                <div className="flex justify-between items-center mb-10 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${step >= s ? "bg-primary border-primary text-white" : "bg-white border-slate-300"
                                }`}
                        >
                            {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
                    {step === 1 && (
                        <CardContent className="p-8">
                            <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" /> Account Setup
                            </h2>
                            <form onSubmit={handleAccountSetup} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input value={invitation.email} readOnly className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Create Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Confirm Password</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary h-12 text-lg">
                                    Next: Payment <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </form>
                        </CardContent>
                    )}

                    {step === 2 && (
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CreditCard className="h-10 w-10 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-secondary">Membership Fees</h2>
                                <p className="text-muted-foreground mt-2">Annual dues are required for all members. You can also choose to support our recapitalization goal.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Mandatory Annual Dues */}
                                <div className="p-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50/20 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-secondary text-lg">Annual Professional Dues</span>
                                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">Mandatory yearly professional membership renewal fee.</p>
                                    <span className="text-xl font-bold text-secondary">₦12,000</span>
                                </div>

                                {/* Optional Recapitalization Fee */}
                                <div
                                    onClick={() => setIncludeRecapitalization(!includeRecapitalization)}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all text-left ${includeRecapitalization ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-secondary text-lg">Recapitalization Fee</span>
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">Optional</span>
                                        </div>
                                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${includeRecapitalization ? "border-primary" : "border-slate-300"}`}>
                                            {includeRecapitalization && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">A one-time contribution toward the institute's national recapitalization initiative.</p>
                                    <span className="text-xl font-bold text-primary">₦100,000</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-dashed text-left">
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <span className="text-lg font-medium">Total to Pay</span>
                                    <span className="text-3xl font-extrabold text-secondary">₦{paymentAmount.toLocaleString()}</span>
                                </div>
                                <PaystackPaymentHandler
                                    email={invitation.email}
                                    amount={paymentAmount}
                                    useRedirect={true}
                                    callbackUrl={`${window.location.host.includes('localhost') ? 'http://' : 'https://'}${window.location.host}/payment/callback`}
                                    metadata={{
                                        registration_type: 'founding',
                                        token: token,
                                        full_name: invitation.full_name
                                    }}
                                    onSuccess={handlePaymentSuccess}
                                    className="w-full bg-primary h-14 text-lg"
                                    buttonText={`Pay ₦${paymentAmount.toLocaleString()}`}
                                />
                                <p className="text-xs text-muted-foreground mt-4 px-8 text-center">
                                    Secure payment gateway provided by Paystack. Your financial data is never stored on our servers.
                                </p>
                            </div>
                        </CardContent>
                    )}

                    {step === 3 && (
                        <CardContent className="p-8 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-secondary">KYC Verification</h2>
                                <p className="text-muted-foreground mt-2">Almost there! We need to verify your identity for the national registry.</p>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</div>
                                        Passport Photograph
                                    </Label>
                                    <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-colors text-center ${files.passport ? "border-emerald-500 bg-emerald-50/50" : "hover:border-primary hover:bg-primary/5"}`}>
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, 'passport')} />
                                        <div className="space-y-2">
                                            <Upload className={`mx-auto h-8 w-8 ${files.passport ? "text-emerald-500" : "text-slate-400"}`} />
                                            <p className="text-sm font-medium">{files.passport ? files.passport.name : "Click to upload passport photo"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">2</div>
                                        Valid Means of ID
                                    </Label>
                                    <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-colors text-center ${files.idCard ? "border-emerald-500 bg-emerald-50/50" : "hover:border-primary hover:bg-primary/5"}`}>
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'idCard')} />
                                        <div className="space-y-2">
                                            <Upload className={`mx-auto h-8 w-8 ${files.idCard ? "text-emerald-500" : "text-slate-400"}`} />
                                            <p className="text-sm font-medium">{files.idCard ? files.idCard.name : "Click to upload ID (NIN, Driver License, etc)"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCompleteKYC}
                                className="w-full bg-primary h-14 text-lg"
                                disabled={uploading || !files.passport || !files.idCard}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Finalizing Account...
                                    </>
                                ) : (
                                    "Complete Registration"
                                )}
                            </Button>
                        </CardContent>
                    )}

                    {step === 4 && (
                        <CardContent className="p-12 text-center space-y-6">
                            <div className="mx-auto h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-secondary">Congratulations!</h2>
                                <p className="text-lg text-muted-foreground mt-2">You are now a registered Founding Member of NIC.</p>
                            </div>
                            <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20">
                                <p className="text-sm text-secondary font-medium">Your account is active. You can now access your member portal to download your digital ID and explore resources.</p>
                            </div>
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full bg-primary h-14 text-lg"
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    By completing this onboarding, you agree to the National Institute of Caregivers professional code of conduct and data protection policies.
                </p>
            </div>
        </div >
    )
}


export default function FoundingOnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <FoundingOnboardingFlow />
        </Suspense>
    )
}
