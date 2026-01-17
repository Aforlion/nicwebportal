"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    ShieldCheck,
    AlertTriangle,
    ArrowRight,
    History,
    MapPin,
    Building2,
    CalendarCheck,
    Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FacilityDashboard() {
    const [loading, setLoading] = useState(true)
    const [facility, setFacility] = useState<any>(null)
    const [staffCount, setStaffCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        fetchFacilityData()
    }, [])

    const fetchFacilityData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Facility
            const { data: facData } = await supabase
                .from('facilities')
                .select('*')
                .eq('owner_id', user.id)
                .single()

            setFacility(facData)

            if (facData) {
                // 2. Fetch Staff Count
                const { count } = await supabase
                    .from('facility_staff')
                    .select('*', { count: 'exact', head: true })
                    .eq('facility_id', facData.id)
                    .eq('is_active', true)

                setStaffCount(count || 0)
            }
        } catch (err) {
            console.error("Error fetching facility dashboard:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading Institutional Dashboard...</div>

    if (!facility) return (
        <Card className="max-w-xl mx-auto mt-20">
            <CardHeader>
                <CardTitle>Facility Registration Not Found</CardTitle>
                <CardDescription>If you recently registered, your account may still be under review.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" asChild>
                    <a href="/join/facility">Register New Facility</a>
                </Button>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Institutional Dashboard</h1>
                    <p className="text-muted-foreground">Manage {facility.name} registration and staff compliance.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className={`h-8 px-4 text-xs font-bold ${facility.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                        STATUS: {facility.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Staff</p>
                                <p className="text-2xl font-bold text-secondary">{staffCount}</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Compliance Score</p>
                                <p className="text-2xl font-bold text-emerald-600">{facility.compliance_score || 0}%</p>
                            </div>
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-accent uppercase tracking-widest">Next Inspection</p>
                                <p className="text-sm font-bold text-secondary">
                                    {facility.next_inspection_date ? new Date(facility.next_inspection_date).toLocaleDateString() : 'Not Scheduled'}
                                </p>
                            </div>
                            <CalendarCheck className="h-8 w-8 text-accent" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-secondary uppercase tracking-widest">Registry ID</p>
                                <p className="text-[10px] font-mono font-bold text-muted-foreground truncate max-w-[100px]">{facility.registration_number}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-slate-300" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Facility Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Facility Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Address</p>
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {facility.address}, {facility.city}, {facility.state}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Capacity</p>
                                <p className="text-sm font-medium text-secondary">{facility.capacity} Residents/Patients</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-secondary">Recent Staff Additions</h3>
                                <Button variant="link" className="text-primary text-xs h-auto p-0" asChild>
                                    <a href="/portal/facility/staff">View All Staff</a>
                                </Button>
                            </div>
                            <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm italic">Staff linking active. Start adding your caregivers to enable verification.</p>
                                <Button size="sm" variant="outline" className="mt-4" asChild>
                                    <a href="/portal/facility/link">Link a Caregiver</a>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & Compliance */}
                <div className="space-y-6">
                    <Card className="border-accent/10 bg-accent/5">
                        <CardHeader>
                            <CardTitle className="text-sm">Compliance Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span>Regulatory License</span>
                                <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 h-5">VALID</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span>Insurance Policy</span>
                                <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 h-5">VALID</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span>Fire Safety Cert</span>
                                <Badge className="bg-yellow-100 text-yellow-700 border-none px-2 h-5">EXPIRING</Badge>
                            </div>
                            <Button className="w-full text-xs" variant="outline" size="sm">
                                Manage Documents
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                <div className="p-4 flex gap-3 hover:bg-muted/30 transition-colors">
                                    <History className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-secondary">Facility registered successfully</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(facility.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
