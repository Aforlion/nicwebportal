"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react"

const members = [
    { id: 1, name: "Grace Obi", memberID: "NIC-MEM-5502", category: "Full Member", status: "Active", joinDate: "March 2024", email: "grace.obi@example.com" },
    { id: 2, name: "John Adebayo", memberID: "NIC-MEM-5503", category: "Associate", status: "Active", joinDate: "Feb 2024", email: "john.a@example.com" },
    { id: 3, name: "Sarah Nwosu", memberID: "NIC-MEM-5504", category: "Student", status: "Pending", joinDate: "Jan 2024", email: "sarah.n@example.com" },
    { id: 4, name: "Michael Okafor", memberID: "NIC-MEM-5505", category: "Trainer", status: "Active", joinDate: "Dec 2023", email: "michael.o@example.com" },
    { id: 5, name: "Blessing Eze", memberID: "NIC-MEM-5506", category: "Full Member", status: "Suspended", joinDate: "Nov 2023", email: "blessing.e@example.com" },
]

export default function AdminMembersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />{status}</Badge>
            case "Pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="h-3 w-3 mr-1" />{status}</Badge>
            case "Suspended":
                return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" />{status}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Member Management</h1>
                    <p className="text-muted-foreground">View and manage all NIC members</p>
                </div>
                <Button className="bg-primary">
                    <Download className="mr-2 h-4 w-4" />
                    Export Members
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                                <p className="text-3xl font-bold text-secondary">1,247</p>
                            </div>
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-3xl font-bold text-emerald-600">1,189</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-3xl font-bold text-amber-600">42</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                                <p className="text-3xl font-bold text-red-600">16</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or member ID..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex h-10 w-full md:w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="all">All Categories</option>
                            <option value="student">Student</option>
                            <option value="associate">Associate</option>
                            <option value="full">Full Member</option>
                            <option value="trainer">Trainer</option>
                            <option value="institutional">Institutional</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Members Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Members</CardTitle>
                    <CardDescription>Complete list of registered members</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-muted-foreground">
                                    <th className="py-4 text-left font-medium">Member</th>
                                    <th className="py-4 text-left font-medium">Member ID</th>
                                    <th className="py-4 text-left font-medium">Category</th>
                                    <th className="py-4 text-left font-medium">Status</th>
                                    <th className="py-4 text-left font-medium">Joined</th>
                                    <th className="py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-muted/30">
                                        <td className="py-4">
                                            <div>
                                                <p className="font-medium text-secondary">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 font-mono text-xs">{member.memberID}</td>
                                        <td className="py-4">
                                            <Badge variant="outline">{member.category}</Badge>
                                        </td>
                                        <td className="py-4">{getStatusBadge(member.status)}</td>
                                        <td className="py-4 text-muted-foreground">{member.joinDate}</td>
                                        <td className="py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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
