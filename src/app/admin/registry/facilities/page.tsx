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
    Plus,
    Check,
    Ban,
    AlertTriangle,
    Calendar
} from "lucide-react"
import { sendFacilityStatusAction } from "@/lib/actions/registration"

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

    // Action Modal State
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean
        facility: Facility | null
        type: 'suspend' | 'revoke' | 'approve' | 'reinstate' | null
        reason: string
        submitting: boolean
    }>({
        isOpen: false,
        facility: null,
        type: null,
        reason: "",
        submitting: false
    })

    // Inspection Modal State
    const [inspectionModal, setInspectionModal] = useState<{
        isOpen: boolean
        facility: Facility | null
        date: string
        time: string
        inspector: string
        submitting: boolean
    }>({
        isOpen: false,
        facility: null,
        date: "",
        time: "",
        inspector: "NIC Regional Inspector",
        submitting: false
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

    const openActionModal = (facility: Facility, type: 'suspend' | 'revoke' | 'approve' | 'reinstate') => {
        setActionModal({
            isOpen: true,
            facility,
            type,
            reason: "",
            submitting: false
        })
    }

    const handleActionSubmit = async () => {
        if (!actionModal.facility || !actionModal.type) return

        // Validation: Reason required for negative actions
        if ((actionModal.type === 'suspend' || actionModal.type === 'revoke') && !actionModal.reason) {
            alert("Please provide a reason for this action.")
            return
        }

        setActionModal(prev => ({ ...prev, submitting: true }))

        try {
            const newStatus =
                actionModal.type === 'approve' ? 'active' :
                    actionModal.type === 'reinstate' ? 'active' :
                        actionModal.type === 'suspend' ? 'suspended' : 'revoked'

            const { error } = await supabase
                .from('facilities')
                .update({
                    status: newStatus,
                })
                .eq('id', actionModal.facility.id)

            if (error) throw error

            // Log action in audit trail
            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('registry_actions').insert({
                target_type: 'facility',
                target_id: actionModal.facility.id,
                action_type: actionModal.type,
                reason: actionModal.reason || `Administrative status update to ${newStatus}`,
                performed_by: user?.id
            })

            // Refresh UI
            await fetchFacilities()
            setActionModal({ isOpen: false, facility: null, type: null, reason: "", submitting: false })

            // Send Email Notification
            const emailStatusMap: Record<string, 'approved' | 'denied' | 'action_required'> = {
                'approve': 'approved',
                'reinstate': 'approved',
                'suspend': 'action_required',
                'revoke': 'denied'
            }

            if (actionModal.facility.email) {
                await sendFacilityStatusAction(
                    actionModal.facility.email,
                    actionModal.facility.name,
                    "", // Owner name
                    emailStatusMap[actionModal.type] || 'action_required',
                    actionModal.reason,
                    actionModal.facility.registration_number
                )
            }
        } catch (err) {
            console.error("Error updating facility status:", err)
            alert("Failed to update status")
        } finally {
            setActionModal(prev => ({ ...prev, submitting: false }))
        }
    }

    const handleInspectionSubmit = async () => {
        if (!inspectionModal.facility || !inspectionModal.date || !inspectionModal.time) {
            alert("Please fill in all inspection details.")
            return
        }

        setInspectionModal(prev => ({ ...prev, submitting: true }))

        try {
            // 1. Update Facility Next Inspection Date in DB
            const { error: updateError } = await supabase
                .from('facilities')
                .update({
                    next_inspection_date: inspectionModal.date,
                    status: 'pending' // Optionally set back to pending or a specific 'under_review' if you have it
                })
                .eq('id', inspectionModal.facility.id)

            if (updateError) throw updateError

            // 2. Log in audit trail
            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('registry_actions').insert({
                target_type: 'facility',
                target_id: inspectionModal.facility.id,
                action_type: 'schedule_inspection',
                reason: `Inspection scheduled for ${inspectionModal.date} at ${inspectionModal.time}`,
                performed_by: user?.id
            })

            // 3. Send Notification Email
            const { sendInspectionScheduledAction } = await import("@/lib/actions/registration")
            await sendInspectionScheduledAction(
                inspectionModal.facility.email,
                inspectionModal.facility.name,
                "", // ownerName 
                inspectionModal.date,
                inspectionModal.time,
                inspectionModal.inspector
            )

            alert("Inspection scheduled and facility notified!")
            setInspectionModal({ isOpen: false, facility: null, date: "", time: "", inspector: "NIC Regional Inspector", submitting: false })
            fetchFacilities()
        } catch (err: any) {
            console.error("Error scheduling inspection:", err)
            alert("Failed to schedule inspection: " + err.message)
        } finally {
            setInspectionModal(prev => ({ ...prev, submitting: false }))
        }
    }

    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Fully Compliant'
            case 'pending': return 'Awaiting Inspection'
            case 'suspended': return 'Suspended'
            case 'revoked': return 'Non-Compliant'
            default: return status.toUpperCase()
        }
    }

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
                                            <Badge className={getStatusColor(f.status)}>{getStatusLabel(f.status)}</Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {f.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={() => openActionModal(f, 'approve')}
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
                                                        onClick={() => openActionModal(f, 'suspend')}
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
                                                        onClick={() => openActionModal(f, 'reinstate')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Reinstate
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-primary text-primary"
                                                    onClick={() => setInspectionModal({
                                                        isOpen: true,
                                                        facility: f,
                                                        date: "",
                                                        time: "",
                                                        inspector: "NIC Regional Inspector",
                                                        submitting: false
                                                    })}
                                                >
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Schedule
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600"
                                                    onClick={() => openActionModal(f, 'revoke')}
                                                >
                                                    <ShieldOff className="h-4 w-4" />
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

            {/* Action Modal Overlay */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                {actionModal.type === 'approve' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                                {actionModal.type === 'suspend' && <XCircle className="h-5 w-5 text-orange-600" />}
                                {actionModal.type === 'revoke' && <ShieldOff className="h-5 w-5 text-red-600" />}
                                {actionModal.type === 'reinstate' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                                <span className="capitalize">{actionModal.type} Facility</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{actionModal.facility?.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{actionModal.facility?.registration_number}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">
                                    Reason / Comments
                                </label>
                                <textarea
                                    className="w-full h-32 p-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none outline-none"
                                    placeholder={
                                        actionModal.type === 'approve' ? "Extra feedback for the facility owner (optional)..." :
                                            actionModal.type === 'suspend' ? "Reason for suspension (required)..." :
                                                actionModal.type === 'revoke' ? "Reason for revocation (required)..." :
                                                    "Reason for reinstatement..."
                                    }
                                    value={actionModal.reason}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                                />
                                <p className="text-[10px] text-orange-600 font-medium bg-orange-50 p-2 rounded border border-orange-100 italic">
                                    Note: The facility administrator will be notified immediately via email with this status update and reason.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={() => setActionModal({ isOpen: false, facility: null, type: null, reason: "", submitting: false })}
                                    disabled={actionModal.submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`flex-1 text-white ${actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                        actionModal.type === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' :
                                            actionModal.type === 'revoke' ? 'bg-red-600 hover:bg-red-700' :
                                                'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                    onClick={handleActionSubmit}
                                    disabled={actionModal.submitting}
                                >
                                    {actionModal.submitting ? "Processing..." : `Confirm ${actionModal.type}`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Inspection Modal Overlay */}
            {inspectionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Calendar className="h-5 w-5 text-primary" />
                                Schedule Compliance Inspection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-slate-500" />
                                <div>
                                    <p className="font-bold text-slate-800">{inspectionModal.facility?.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{inspectionModal.facility?.registration_number}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date</label>
                                    <Input
                                        type="date"
                                        value={inspectionModal.date}
                                        onChange={(e) => setInspectionModal(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Time</label>
                                    <Input
                                        type="time"
                                        value={inspectionModal.time}
                                        onChange={(e) => setInspectionModal(prev => ({ ...prev, time: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Assigned Inspector</label>
                                <Input
                                    placeholder="e.g., John Doe"
                                    value={inspectionModal.inspector}
                                    onChange={(e) => setInspectionModal(prev => ({ ...prev, inspector: e.target.value }))}
                                />
                            </div>

                            <p className="text-[10px] text-primary font-medium bg-blue-50 p-2 rounded border border-blue-100 italic">
                                Note: This will notify the facility and mark their status as "Under Review".
                            </p>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={() => setInspectionModal({ isOpen: false, facility: null, date: "", time: "", inspector: "NIC Regional Inspector", submitting: false })}
                                    disabled={inspectionModal.submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                    onClick={handleInspectionSubmit}
                                    disabled={inspectionModal.submitting}
                                >
                                    {inspectionModal.submitting ? "Processing..." : "Schedule & Notify"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
