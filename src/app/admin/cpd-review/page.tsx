"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Eye,
    Download
} from "lucide-react"

const cpdSubmissions = [
    { id: 1, memberName: "Grace Obi", memberID: "NIC-MEM-5502", activity: "Infection Control Update", provider: "NIC Nigeria", points: 5, date: "Jan 05, 2024", status: "Pending", certificate: true },
    { id: 2, memberName: "John Adebayo", memberID: "NIC-MEM-5503", activity: "Dementia Care Workshop", provider: "Lagos State Health", points: 8, date: "Dec 12, 2023", status: "Pending", certificate: true },
    { id: 3, memberName: "Sarah Nwosu", memberID: "NIC-MEM-5504", activity: "Ethics in Communication", provider: "Reading Material", points: 2, date: "Nov 20, 2023", status: "Approved", certificate: false },
]

export default function AdminCPDReviewPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const handleApprove = (id: number) => {
        // TODO: Implement approval logic
        console.log("Approve CPD:", id)
    }

    const handleReject = (id: number) => {
        // TODO: Implement rejection logic
        console.log("Reject CPD:", id)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">CPD Review</h1>
                    <p className="text-muted-foreground">Review and approve member CPD submissions</p>
                </div>
                <Button className="bg-primary">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                                <p className="text-3xl font-bold text-amber-600">24</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Approved This Month</p>
                                <p className="text-3xl font-bold text-emerald-600">156</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                                <p className="text-3xl font-bold text-red-600">8</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by member name, ID, or activity..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending CPD Submissions</CardTitle>
                    <CardDescription>Review and approve member professional development activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-muted-foreground">
                                    <th className="py-4 text-left font-medium">Member</th>
                                    <th className="py-4 text-left font-medium">Activity</th>
                                    <th className="py-4 text-left font-medium">Provider</th>
                                    <th className="py-4 text-center font-medium">Points</th>
                                    <th className="py-4 text-left font-medium">Date</th>
                                    <th className="py-4 text-left font-medium">Status</th>
                                    <th className="py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cpdSubmissions.map((submission) => (
                                    <tr key={submission.id} className="group hover:bg-muted/30">
                                        <td className="py-4">
                                            <div>
                                                <p className="font-medium text-secondary">{submission.memberName}</p>
                                                <p className="text-xs font-mono text-muted-foreground">{submission.memberID}</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <p className="font-medium">{submission.activity}</p>
                                            {submission.certificate && (
                                                <Badge variant="outline" className="mt-1 text-xs">Has Certificate</Badge>
                                            )}
                                        </td>
                                        <td className="py-4 text-muted-foreground">{submission.provider}</td>
                                        <td className="py-4 text-center font-bold text-primary">{submission.points}</td>
                                        <td className="py-4 text-muted-foreground">{submission.date}</td>
                                        <td className="py-4">
                                            {submission.status === "Pending" ? (
                                                <Badge className="bg-amber-500 hover:bg-amber-600">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Pending
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Approved
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {submission.status === "Pending" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700"
                                                            onClick={() => handleApprove(submission.id)}
                                                        >
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleReject(submission.id)}
                                                        >
                                                            <XCircle className="mr-1 h-3 w-3" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
