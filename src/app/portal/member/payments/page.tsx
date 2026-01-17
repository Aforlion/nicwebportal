"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CreditCard,
    Download,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Receipt
} from "lucide-react"

const paymentHistory = [
    { id: 1, date: "March 15, 2024", amount: 25000, type: "Annual Dues", status: "Completed", receipt: "RCP-2024-001" },
    { id: 2, date: "March 15, 2023", amount: 25000, type: "Annual Dues", status: "Completed", receipt: "RCP-2023-001" },
]

export default function MemberPaymentsPage() {
    const [isProcessing, setIsProcessing] = useState(false)

    const handlePayment = () => {
        setIsProcessing(true)
        // TODO: Integrate Paystack payment
        setTimeout(() => {
            setIsProcessing(false)
        }, 2000)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Payments & Renewals</h1>
                <p className="text-muted-foreground">Manage your membership dues and view payment history</p>
            </div>

            {/* Current Status */}
            <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-secondary">Membership Active</h3>
                                <p className="text-sm text-muted-foreground">No outstanding dues</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Next Renewal</p>
                            <p className="text-lg font-bold text-secondary">March 31, 2025</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Renewal Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Annual Membership Renewal</CardTitle>
                    <CardDescription>Renew your Full Member (MNIC) status for 2025-2026</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-muted/30 p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Membership Category:</span>
                                <span className="font-medium">Full Member (MNIC)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Renewal Period:</span>
                                <span className="font-medium">April 2025 - March 2026</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">CPD Compliance:</span>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Met (18/30 credits)
                                </Badge>
                            </div>
                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold text-secondary">Annual Dues:</span>
                                    <span className="font-bold text-primary">₦25,000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            className="flex-1 bg-primary"
                            size="lg"
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            <CreditCard className="mr-2 h-5 w-5" />
                            {isProcessing ? "Processing..." : "Pay with Paystack"}
                        </Button>
                        <Button variant="outline" size="lg">
                            <Calendar className="mr-2 h-5 w-5" />
                            Schedule Payment
                        </Button>
                    </div>

                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-900">Renewal Reminder</p>
                                <p className="text-amber-700">
                                    Your membership expires on March 31, 2025. Renew before the deadline to avoid suspension of member benefits.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Your membership payment records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {paymentHistory.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Receipt className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-secondary">{payment.type}</p>
                                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-secondary">₦{payment.amount.toLocaleString()}</p>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                            {payment.status}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
