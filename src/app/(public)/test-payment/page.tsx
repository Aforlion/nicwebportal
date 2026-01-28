"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"
import { toast } from "sonner"

const PaystackPaymentHandler = dynamic(() => import("@/components/paystack-payment-handler"), { ssr: false })

export default function TestPaymentPage() {
    const [email, setEmail] = useState("")
    const [amount, setAmount] = useState(500)

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Paystack Test Transaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            placeholder="test@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Amount (NGN)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </div>

                    <PaystackPaymentHandler
                        email={email}
                        amount={amount}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
                        buttonText={`Pay NGN ${amount}`}
                        onSuccess={() => toast.success("Payment Successful! Gateway is working.")}
                        useRedirect={false} // Inline is faster for testing
                    />

                    <p className="text-xs text-muted-foreground text-center">
                        This is a test mode transaction. Ensure you are using Paystack Test Cards.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
