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
    Receipt,
    Loader2,
    ArrowUpRight
} from "lucide-react"

interface Payment {
    id: string
    date: string
    amount: number
    type: string
    status: string
    receipt: string
    url: string
}

interface MemberPaymentsClientProps {
    data: {
        payments: Payment[]
        membership: {
            category: string
            expiryDate: string
            isActive: boolean
            cpdPoint: number
            cpdTarget: number
        }
    }
}

export default function MemberPaymentsClient({ data }: MemberPaymentsClientProps) {
    const { payments, membership } = data
    const [isProcessing, setIsProcessing] = useState(false)

    const handlePayment = () => {
        setIsProcessing(true)
        // This will be connected to Paystack in a future step or handled via external link
        window.location.href = "https://paystack.com/pay/nic-renewal" // Example placeholder
    }

    const isCPDCompliant = membership.cpdPoint >= membership.cpdTarget

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Payments & Renewals</h1>
                    <p className="text-muted-foreground">Manage your membership dues and view payment history</p>
                </div>
            </div>

            {/* Current Status */}
            <Card className={membership.isActive ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${membership.isActive ? "bg-emerald-100" : "bg-amber-100"}`}>
                                {membership.isActive ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-secondary">Membership {membership.isActive ? "Active" : "Inactive"}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {membership.isActive ? "No outstanding dues for current period" : "Payment required to reactivate"}
                                </p>
                            </div>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-sm text-muted-foreground">Registry Expiry</p>
                            <p className="text-lg font-bold text-secondary">{membership.expiryDate}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Renewal Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Annual Membership Renewal</CardTitle>
                    <CardDescription>Renew your {membership.category} status for the next cycle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-muted/30 p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Membership Category:</span>
                                <span className="font-medium capitalize">{membership.category} Member</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">CPD Compliance:</span>
                                <Badge variant="outline" className={isCPDCompliant ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                                    {isCPDCompliant ? (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                    ) : (
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {isCPDCompliant ? "Met" : "In Progress"} ({membership.cpdPoint}/{membership.cpdTarget} points)
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

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            className="flex-1 bg-primary"
                            size="lg"
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <CreditCard className="mr-2 h-5 w-5" />
                            )}
                            {isProcessing ? "Processing..." : "Pay with Paystack"}
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/contact">
                                <Calendar className="mr-2 h-5 w-5" />
                                Request Extension
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-900">Renewal Notice</p>
                                <p className="text-amber-700">
                                    Official renewals open 60 days before expiry. Ensure all your CPD logs are approved before payment to enjoy seamless renewal.
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
                        {payments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground italic border-dashed border-2 rounded-xl">
                                <Receipt className="mx-auto h-12 w-12 mb-4 opacity-10" />
                                <p>No payment records found.</p>
                            </div>
                        ) : (
                            payments.map((payment) => (
                                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/30 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Receipt className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-secondary">{payment.type}</p>
                                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                        <div className="sm:text-right">
                                            <p className="font-bold text-secondary text-lg">₦{payment.amount.toLocaleString()}</p>
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0">
                                                {payment.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        {payment.url && (
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={payment.url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

import Link from "next/link"
