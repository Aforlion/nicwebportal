"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Building2,
    ShieldCheck,
    ShieldOff,
    CheckCircle,
    XCircle,
    MapPin,
    Users,
    Activity,
    History,
    MoreHorizontal,
    Plus
} from "lucide-react"

type Facility = {
    id: string
    name: string
    registration_number: string
    facility_type: string
    email: string
    phone: string
    address: string
    state: string
    city: string
    capacity: number
    status: string
    compliance_score: number
    last_inspection_date: string
    next_inspection_date: string
    owner_id: string
}

export default function AdminFacilitiesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0
    })

    const supabase = createClient()

    useEffect(() => {
        fetchFacilities()
    }, [statusFilter])

    const fetchFacilities = async () => {
        setLoading(true)
        try {
            let query = supabase.from('facilities').select('*')

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query
            if (error) throw error
            setFacilities(data || [])

            // Fetch stats (simple version)
            const { data: allData } = await supabase.from('facilities').select('status')
            if (allData) {
                const s = { total: allData.length, active: 0, pending: 0, suspended: 0 }
                allData.forEach(f => {
                    if (f.status === 'active') s.active++
                    else if (f.status === 'pending') s.pending++
                    else if (f.status === 'suspended' || f.status === 'revoked') s.suspended++
                })
                setStats(s)
            }
        } catch (err) {
            console.error("Error fetching facilities:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('facilities')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            // Log action in audit trail
            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('registry_actions').insert({
                target_type: 'facility',
                target_id: id,
                action_type: newStatus === 'active' ? 'reinstate' : (newStatus === 'suspended' ? 'suspend' : 'revoke'),
                reason: `Administrative status update to ${newStatus}`,
                performed_by: user?.id
            })

            fetchFacilities()
        } catch (err) {
            console.error("Error updating facility status:", err)
            alert("Failed to update status")
        }
    }

    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500'
            case 'pending': return 'bg-yellow-500'
            case 'suspended': return 'bg-orange-500'
            case 'revoked': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Care Facility Registry</h1>
                    <p className="text-muted-foreground">Approve and manage nursing homes, agencies, and clinics</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/admin/registry/caregivers/audit-trail'}>
                        <History className="mr-2 h-4 w-4" />
                        Audit Trail
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Facility
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Facilities</p>
                                <p className="text-3xl font-bold text-secondary">{stats.total}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Units</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Activity className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                                <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
                            </div>
                            <ShieldOff className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Registry</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by facility name, RC code, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Registered Institutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                                    <th className="p-4">Facility</th>
                                    <th className="p-4">Reg No.</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Staff Count</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center p-8">Loading...</td></tr>
                                ) : filteredFacilities.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center p-8">No facilities found.</td></tr>
                                ) : filteredFacilities.map((f) => (
                                    <tr key={f.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-bold text-secondary">{f.name}</p>
                                                <p className="text-xs text-muted-foreground italic uppercase">{f.facility_type?.replace('_', ' ')}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs">{f.registration_number}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {f.city}, {f.state}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-xs">
                                                <Users className="h-3 w-3" />
                                                -
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={getStatusColor(f.status)}>{f.status}</Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {f.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={() => handleUpdateStatus(f.id, 'active')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                )}
                                                {f.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-orange-600"
                                                        onClick={() => handleUpdateStatus(f.id, 'suspended')}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Suspend
                                                    </Button>
                                                )}
                                                {f.status === 'suspended' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-emerald-600"
                                                        onClick={() => handleUpdateStatus(f.id, 'active')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Reinstate
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
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
