"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { finalizeRegistrationAction } from "@/lib/actions/registration"
import { Loader2, XCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function CallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const reference = searchParams.get("reference")
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
    const [message, setMessage] = useState("Verifying your payment...")

    useEffect(() => {
        if (!reference) {
            setStatus("error")
            setMessage("No transaction reference found.")
            return
        }

        const verify = async () => {
            const result = await finalizeRegistrationAction(reference)
            if (result.success) {
                setStatus("success")
                setMessage("Payment verified successfully!")

                // Redirect based on type
                if (result.type === 'founding') {
                    // Redirect back to onboarding at Step 3 (KYC)
                    // We need to pass the token back
                    router.push(`/onboard/founding?token=${result.token}&step=3&paid=true&reference=${reference}`)
                } else {
                    // Default behavior
                    setTimeout(() => {
                        router.push('/payment/success?reference=' + reference)
                    }, 2000)
                }
            } else {
                setStatus("error")
                setMessage(result.message || "Verification failed.")
            }
        }

        verify()
    }, [reference, router])

    if (status === "verifying") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div>
                    <h2 className="text-2xl font-bold text-secondary italic">Finalizing Payment</h2>
                    <p className="text-muted-foreground">{message}</p>
                </div>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <XCircle className="h-16 w-16 text-destructive" />
                <div>
                    <h2 className="text-2xl font-bold text-secondary">Verification Failed</h2>
                    <p className="text-muted-foreground">{message}</p>
                </div>
                <Button onClick={() => router.push('/')} variant="outline">Return Home</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <div>
                <h2 className="text-2xl font-bold text-secondary italic">Payment Success!</h2>
                <p className="text-muted-foreground italic">Redirecting you to complete your registration...</p>
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
    )
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center italic">Initializing verification...</div>}>
            <CallbackContent />
        </Suspense>
    )
}
