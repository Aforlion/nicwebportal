"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    Search,
    MapPin,
    Calendar,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
    ArrowRight,
    Plus
} from "lucide-react"

const facilities = [
    {
        id: "FAC-LA-001",
        name: "Golden Years Nursing Home",
        location: "Ikeja, Lagos",
        status: "Compliant",
        lastInspection: "2023-11-10",
        staffCount: 24,
    },
    {
        id: "FAC-ABJ-022",
        name: "Abuja Care Sanctuary",
        location: "Asokoro, Abuja",
        status: "Pending Inspection",
        lastInspection: "N/A",
        staffCount: 12,
    },
    {
        id: "FAC-IB-009",
        name: "Ibadan Mercy Home",
        location: "Bodija, Ibadan",
        status: "Non-Compliant",
        lastInspection: "2024-01-05",
        staffCount: 8,
    },
    {
        id: "FAC-PH-015",
        name: "Riverside Elderly Haven",
        location: "GRA, Port Harcourt",
        status: "Compliant",
        lastInspection: "2023-09-20",
        staffCount: 30,
    }
]

export default function AdminInspectionsPage() {
    const [search, setSearch] = useState("")

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-secondary">Facility Regulation</h1>
                    <p className="text-muted-foreground">Manage care facility compliance, inspections, and licensing.</p>
                </div>
                <Button className="bg-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Register New Facility
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Facilities</p>
                        <div className="text-2xl font-bold text-secondary mt-1">482</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Compliant</p>
                        <div className="text-2xl font-bold text-secondary mt-1">394</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pending</p>
                        <div className="text-2xl font-bold text-secondary mt-1">64</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-destructive uppercase tracking-widest">Critical</p>
                        <div className="text-2xl font-bold text-secondary mt-1">24</div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search facilities by name or location..."
                    className="pl-10 h-12"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {facilities.map((fac) => (
                    <Card key={fac.id} className="group hover:shadow-md transition-all">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-secondary">{fac.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground font-mono">{fac.id}</p>
                                    </div>
                                </div>
                                {fac.status === 'Compliant' ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                        <ShieldCheck className="mr-1 h-3 w-3" /> COMPLIANT
                                    </Badge>
                                ) : fac.status === 'Non-Compliant' ? (
                                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-none">
                                        <ShieldAlert className="mr-1 h-3 w-3" /> NON-COMPLIANT
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                                        <ShieldQuestion className="mr-1 h-3 w-3" /> PENDING
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    {fac.location}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Last: {fac.lastInspection}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="text-xs font-bold text-muted-foreground">{fac.staffCount} Certified Staff</span>
                                <Button variant="ghost" size="sm" className="h-8 hover:text-primary" asChild>
                                    <a href={`/admin/inspections/${fac.id}`}>
                                        Manage <ArrowRight className="ml-2 h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
