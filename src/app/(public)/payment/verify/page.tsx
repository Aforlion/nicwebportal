"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyTransaction } from "@/lib/payments/paystack"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function VerifyContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const reference = searchParams.get("reference")

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        if (!reference) {
            setStatus("error")
            setErrorMessage("No transaction reference found.")
            return
        }

        const checkStatus = async () => {
            const result = await verifyTransaction(reference)
            if (result.success && result.data.status === "success") {
                setStatus("success")
            } else {
                setStatus("error")
                setErrorMessage(result.error || "Payment verification failed.")
            }
        }

        checkStatus()
    }, [reference])

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="mt-4 text-2xl font-bold text-secondary">Verifying Payment...</h2>
                <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
            </div>
        )
    }

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle2 className="h-20 w-20 text-emerald-500" />
                <h2 className="mt-6 text-3xl font-bold text-secondary">Payment Successful!</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    Thank you for your payment. Your transaction has been confirmed.
                </p>
                <div className="mt-8 flex gap-4">
                    <Button className="bg-primary" asChild>
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/programs">Browse More Programs</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <XCircle className="h-20 w-20 text-destructive" />
            <h2 className="mt-6 text-3xl font-bold text-secondary">Payment Failed</h2>
            <p className="mt-2 text-lg text-muted-foreground">
                {errorMessage || "We could not verify your payment. Please try again or contact support."}
            </p>
            <div className="mt-8 flex gap-4">
                <Button className="bg-primary" asChild>
                    <Link href="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    )
}

export default function PaymentVerifyPage() {
    return (
        <div className="container mx-auto px-4">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }>
                <VerifyContent />
            </Suspense>
        </div>
    )
}
