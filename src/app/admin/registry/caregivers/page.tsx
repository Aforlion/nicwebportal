"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Users,
    ShieldCheck,
    ShieldOff,
    ShieldAlert,
    Download,
    Eye,
    Ban,
    CheckCircle,
    XCircle,
    AlertTriangle
} from "lucide-react"

export default function AdminRegistryPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [complianceFilter, setComplianceFilter] = useState("all")

    // Mock data - will be replaced with real Supabase data
    const caregivers = [
        {
            id: "1",
            nicId: "NIC-MEM-5502",
            fullName: "Grace Obi",
            category: "full",
            status: "active",
            complianceStatus: "compliant",
            cpdCompliant: true,
            joinedDate: "2024-03-15",
            expiryDate: "2025-03-30",
            certifications: 2,
            email: "grace.obi@example.com",
            phone: "+234 907 984 553"
        },
        {
            id: "2",
            nicId: "NIC-MEM-4401",
            fullName: "John Adebayo",
            category: "associate",
            status: "active",
            complianceStatus: "under_review",
            cpdCompliant: false,
            joinedDate: "2024-01-10",
            expiryDate: "2025-01-10",
            certifications: 1,
            email: "john.a@example.com",
            phone: "+234 803 123 4567"
        },
        {
            id: "3",
            nicId: "NIC-MEM-3302",
            fullName: "Amina Mohammed",
            category: "full",
            status: "suspended",
            complianceStatus: "suspended",
            cpdCompliant: true,
            joinedDate: "2023-11-20",
            expiryDate: "2024-11-20",
            certifications: 3,
            email: "amina.m@example.com",
            phone: "+234 805 987 6543"
        }
    ]

    const stats = {
        total: 1247,
        active: 1089,
        suspended: 23,
        revoked: 5,
        underReview: 130
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'compliant':
                return 'bg-emerald-500'
            case 'under_review':
                return 'bg-yellow-500'
            case 'suspended':
                return 'bg-orange-500'
            case 'revoked':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const handleSuspend = (caregiverId: string) => {
        // TODO: Implement suspend functionality with reason dialog
        console.log("Suspend caregiver:", caregiverId)
    }

    const handleRevoke = (caregiverId: string) => {
        // TODO: Implement revoke functionality with reason dialog
        console.log("Revoke caregiver:", caregiverId)
    }

    const handleReinstate = (caregiverId: string) => {
        // TODO: Implement reinstate functionality
        console.log("Reinstate caregiver:", caregiverId)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Caregiver Registry</h1>
                <p className="text-muted-foreground">Manage and verify all registered caregivers</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-5">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Caregivers</p>
                                <p className="text-3xl font-bold text-secondary">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                            </div>
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.underReview}</p>
                            </div>
                            <ShieldAlert className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.suspended}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revoked</p>
                                <p className="text-3xl font-bold text-red-600">{stats.revoked}</p>
                            </div>
                            <ShieldOff className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[300px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, ID, certificate number, or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-10 w-full md:w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="revoked">Revoked</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">All Categories</option>
                                <option value="student">Student</option>
                                <option value="associate">Associate</option>
                                <option value="full">Full Member</option>
                                <option value="trainer">Trainer</option>
                            </select>
                            <select
                                value={complianceFilter}
                                onChange={(e) => setComplianceFilter(e.target.value)}
                                className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">All Compliance</option>
                                <option value="compliant">Compliant</option>
                                <option value="under_review">Under Review</option>
                                <option value="non_compliant">Non-Compliant</option>
                            </select>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Caregivers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Registered Caregivers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-medium text-muted-foreground">Caregiver</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Member ID</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">CPD</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Certs</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Expiry</th>
                                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {caregivers.map((caregiver) => (
                                    <tr key={caregiver.id} className="border-b hover:bg-muted/50">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-secondary">{caregiver.fullName}</p>
                                                <p className="text-sm text-muted-foreground">{caregiver.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-sm">{caregiver.nicId}</span>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary">{caregiver.category}</Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={getStatusColor(caregiver.complianceStatus)}>
                                                {caregiver.complianceStatus}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {caregiver.cpdCompliant ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm">{caregiver.certifications}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm">{new Date(caregiver.expiryDate).toLocaleDateString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {caregiver.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleSuspend(caregiver.id)}
                                                    >
                                                        <Ban className="h-4 w-4 text-orange-600" />
                                                    </Button>
                                                )}
                                                {caregiver.status === 'suspended' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleReinstate(caregiver.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    </Button>
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
