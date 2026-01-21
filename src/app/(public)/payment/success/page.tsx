"use client"

import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function SuccessContent() {
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const reference = searchParams.get('reference')

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="mx-auto h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-extrabold text-secondary italic">Payment Received!</h1>
                    <p className="text-muted-foreground">
                        Your transaction was successful. Reference: <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{reference || "N/A"}</span>
                    </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed text-left space-y-3">
                    <h3 className="font-bold text-secondary">What's Next?</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] mt-0.5">1</div>
                            Check your email for your payment receipt.
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] mt-0.5">2</div>
                            Complete your KYC documentation (if required).
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] mt-0.5">3</div>
                            Access your member portal to view your status.
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <Button asChild className="bg-primary h-12 text-lg">
                        <Link href={type === 'founding' ? '/onboard/founding' : '/login'}>
                            Continue Registration <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/">Return to Homepage</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center italic">Loading success details...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
