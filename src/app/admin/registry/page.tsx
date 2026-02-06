"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Filter,
    MoreHorizontal,
    ShieldCheck,
    AlertCircle,
    Download,
    Eye,
    CheckCircle2,
    XCircle
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const registryData = [
    {
        id: "NIC-MEM-5502",
        name: "Grace Obi",
        email: "grace.obi@example.com",
        type: "Professional Caregiver",
        status: "Active",
        expiry: "2025-03-30",
        specialization: "Dementia Care"
    },
    {
        id: "NIC-MEM-8829",
        name: "Samuel Musa",
        email: "samuel.musa@example.com",
        type: "Healthcare Assistant",
        status: "Inactive",
        expiry: "2023-12-15",
        specialization: "General Care"
    },
    {
        id: "NIC-MEM-1204",
        name: "Aisha Bello",
        email: "aisha.b@example.com",
        type: "Professional Caregiver",
        status: "Active",
        expiry: "2025-06-12",
        specialization: "Geriatric Care"
    },
    {
        id: "NIC-MEM-9931",
        name: "Chidi Okafor",
        email: "chidi.o@gmail.com",
        type: "Healthcare Assistant",
        status: "Suspended",
        expiry: "2024-08-01",
        specialization: "General Care"
    },
]

export default function AdminRegistryPage() {
    const [search, setSearch] = useState("")

    const filteredData = registryData.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">National Caregiver Registry</h1>
                <p className="text-muted-foreground">Search, verify, and manage professional licenses across Nigeria.</p>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by Name or ID..."
                        className="pl-10 w-full bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {/* Mobile View */}
                    <div className="md:hidden divide-y">
                        {filteredData.map((item) => (
                            <div key={item.id} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-secondary">{item.name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                            <DropdownMenuItem><ShieldCheck className="mr-2 h-4 w-4" /> Verify</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Type</p>
                                        <p className="font-medium text-secondary">{item.type}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Status</p>
                                        <div className="flex justify-end">{
                                            item.status === 'Active' ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-1.5 py-0">ACTIVE</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-1.5 py-0">{item.status.toUpperCase()}</Badge>
                                            )
                                        }</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b bg-muted/50 text-muted-foreground text-xs font-bold">
                                    <th className="px-6 py-4 uppercase tracking-wider">Caregiver / ID</th>
                                    <th className="px-6 py-4 uppercase tracking-wider">License Type</th>
                                    <th className="px-6 py-4 uppercase tracking-wider">Specialization</th>
                                    <th className="px-6 py-4 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 uppercase tracking-wider">Expiry</th>
                                    <th className="px-6 py-4 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="h-10 w-10 text-slate-200" />
                                                <p>No caregivers found matching "{search}"</p>
                                                <Button variant="link" onClick={() => setSearch("")} className="text-primary h-auto p-0">Clear search</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-secondary">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-secondary">{item.type}</td>
                                            <td className="px-6 py-4 font-medium text-secondary">{item.specialization}</td>
                                            <td className="px-6 py-4">
                                                {item.status === 'Active' ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" /> ACTIVE
                                                    </Badge>
                                                ) : item.status === 'Suspended' ? (
                                                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-none hover:bg-destructive/10">
                                                        <XCircle className="mr-1 h-3 w-3" /> SUSPENDED
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-none hover:bg-slate-200">
                                                        <AlertCircle className="mr-1 h-3 w-3" /> INACTIVE
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium">{item.expiry}</td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" /> View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <ShieldCheck className="mr-2 h-4 w-4" /> Verify Credentials
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            <AlertCircle className="mr-2 h-4 w-4" /> Suspend
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-accent/5 border-accent/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-accent" />
                            Registry Integrity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                        The NIC Registry is the authoritative source for caregiver licensing in Nigeria. All entries are cryptographically signed and periodically audited to against training records and biometric data.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Registered:</span>
                            <span className="font-bold text-secondary">15,204</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Active Licenses:</span>
                            <span className="font-bold text-emerald-600">12,840</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pending Renewals:</span>
                            <span className="font-bold text-amber-600">1,402</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
