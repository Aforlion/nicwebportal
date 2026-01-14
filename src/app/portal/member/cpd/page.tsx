"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    FilePlus,
    History,
    Award,
    CheckCircle2,
    FileText,
    Search,
    ExternalLink
} from "lucide-react"

const cpdLogs = [
    { id: 1, title: "Annual Infection Control Update", provider: "NIC Nigeria", date: "Jan 05, 2024", type: "Training", points: 5, status: "Approved" },
    { id: 2, title: "Advanced Dementia Care Workshop", provider: "Lagos State Health", date: "Dec 12, 2023", type: "Workshop", points: 8, status: "Approved" },
    { id: 3, title: "Ethics in Patient Communication", provider: "Reading Material", date: "Nov 20, 2023", type: "Self-Study", points: 2, status: "Pending" },
    { id: 4, title: "Caregiver Mental Health Seminar", provider: "WHO Africa", date: "Oct 15, 2023", type: "Seminar", points: 3, status: "Approved" },
]

export default function MemberCPDPage() {
    const [search, setSearch] = useState("")

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">CPD Records</h1>
                    <p className="text-muted-foreground">Log and track your Continuing Professional Development (CPD) points.</p>
                </div>
                <Button className="bg-primary">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Log New Activity
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Points</p>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-4xl font-bold text-secondary">18</span>
                            <span className="text-sm font-medium text-muted-foreground mb-1">/ 30 Required</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Approved Logs</p>
                        <div className="flex items-end gap-1 mt-1">
                            <span className="text-4xl font-bold text-secondary">3</span>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Certificates</p>
                        <div className="flex items-end gap-1 mt-1">
                            <span className="text-4xl font-bold text-secondary">12</span>
                            <Award className="h-5 w-5 text-accent mb-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>Your professional development log for the 2024 cycle.</CardDescription>
                        </div>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search logs..."
                                className="pl-10 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b text-muted-foreground">
                                    <th className="py-4 font-medium">Activity</th>
                                    <th className="py-4 font-medium">Date</th>
                                    <th className="py-4 font-medium">Type</th>
                                    <th className="py-4 font-medium text-center">Points</th>
                                    <th className="py-4 font-medium">Status</th>
                                    <th className="py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cpdLogs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-muted/30">
                                        <td className="py-4">
                                            <p className="font-bold text-secondary">{log.title}</p>
                                            <p className="text-xs text-muted-foreground">{log.provider}</p>
                                        </td>
                                        <td className="py-4 text-muted-foreground">{log.date}</td>
                                        <td className="py-4">
                                            <Badge variant="outline" className="font-normal">{log.type}</Badge>
                                        </td>
                                        <td className="py-4 text-center font-bold text-primary">{log.points}</td>
                                        <td className="py-4">
                                            {log.status === 'Approved' ? (
                                                <span className="text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> {log.status}
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 flex items-center gap-1">
                                                    <History className="h-3 w-3" /> {log.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
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
