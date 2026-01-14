"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CreditCard,
    History,
    CheckCircle2,
    Download,
    AlertTriangle,
    Receipt,
    ArrowUpRight
} from "lucide-react"

const paymentHistory = [
    { id: "INV-001", title: "Annual Dues 2024", date: "Jan 15, 2024", amount: "₦25,000", status: "Paid" },
    { id: "INV-002", title: "Certificate Processing Fee", date: "Dec 10, 2023", amount: "₦5,000", status: "Paid" },
    { id: "INV-003", title: "Conference Registration", date: "Nov 02, 2023", amount: "₦15,000", status: "Paid" },
]

export default function MemberPaymentsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Payments & Dues</h1>
                <p className="text-muted-foreground">Manage your membership subscriptions and billing history.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Current Dues Card */}
                <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-secondary">Current Status</CardTitle>
                        <CardDescription>Membership Cycle: 2024/25</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Annual Dues</span>
                            <span className="text-xl font-bold text-secondary">₦25,000</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> UP TO DATE
                            </Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button className="w-full bg-primary" disabled>
                            Next Due: March 2025
                        </Button>
                    </CardFooter>
                </Card>

                {/* Payment Methods / Ad */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-secondary">Outstanding Fees</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full flex flex-col items-center justify-center py-10 text-center space-y-4">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                            <Receipt className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-bold text-secondary">No recorded outstanding fees.</p>
                            <p className="text-sm text-muted-foreground">All your mandatory certifications and dues are currently cleared.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>All your historical transactions with the Institute.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Statement
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {paymentHistory.map((pmt) => (
                            <div key={pmt.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors border-b last:border-0 border-muted">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-secondary">{pmt.title}</p>
                                        <p className="text-xs text-muted-foreground">{pmt.id} • {pmt.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-secondary">{pmt.amount}</p>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs">
                                        View Receipt <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Warning/Info Box */}
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                <div>
                    <h4 className="font-bold text-amber-900">Important Billing Notice</h4>
                    <p className="text-sm text-amber-800 leading-relaxed mt-1">
                        Ensure all payments are made through this portal using Secure Paystack. We do not accept cash payments at office locations or via individual bank transfers to personal accounts. Always download your receipt immediately after payment.
                    </p>
                </div>
            </div>
        </div>
    )
}
