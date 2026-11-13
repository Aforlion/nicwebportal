"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    Calendar,
    Loader2,
    Mail,
    Phone,
    GraduationCap,
    Briefcase,
    Clock,
    FileCheck,
    HelpCircle,
    Eye,
    SlidersHorizontal,
    Home,
    X
} from "lucide-react"
import { sendFacilityStatusAction, sendInspectionScheduledAction } from "@/lib/actions/registration"
import { assignFacilityIdAction } from "@/actions/admin/assign-facility-id"
import { getAdminFacilitiesAction } from "@/actions/admin/get-facilities"
import { FacilityDetailsSheet } from "@/components/admin/facility-details-sheet"
import { toast } from "sonner"

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
    compliance_score?: number
    last_inspection_date?: string
    next_inspection_date?: string
    curriculum_status?: string
    curriculum_url?: string
    owner_id?: string
}

export default function AdminFacilitiesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pendingInspection: 0,
        pendingReview: 0,
        suspended: 0
    })
    const [assigningId, setAssigningId] = useState<string | null>(null)
    const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)

    // Action Modal State (Approve / Suspend / Reinstate / Revoke)
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
        notes: string
        submitting: boolean
    }>({
        isOpen: false,
        facility: null,
        date: "",
        time: "10:00",
        inspector: "NIC Regional Inspector",
        notes: "",
        submitting: false
    })

    const supabase = createClient()

    useEffect(() => {
        fetchFacilities()
    }, [statusFilter])

    const fetchFacilities = async () => {
        setLoading(true)
        try {
            // Priority: Call protected Server Action with Service Role execution
            const res = await getAdminFacilitiesAction(statusFilter)
            if (res && res.facilities) {
                setFacilities(res.facilities)
                if (res.stats) {
                    setStats(res.stats)
                }
                return
            }

            // Fallback: Browser client with registered_at ordering
            let query = supabase.from('facilities').select('*').order('registered_at', { ascending: false })

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query
            if (error) throw error
            setFacilities(data || [])

            // Fetch overall breakdown stats
            const { data: allData } = await supabase.from('facilities').select('status')
            if (allData) {
                const s = { total: allData.length, active: 0, pendingInspection: 0, pendingReview: 0, suspended: 0 }
                allData.forEach((f: any) => {
                    if (f.status === 'active') s.active++
                    else if (f.status === 'pending_inspection') s.pendingInspection++
                    else if (f.status === 'pending') s.pendingReview++
                    else if (f.status === 'suspended' || f.status === 'revoked') s.suspended++
                })
                setStats(s)
            }
        } catch (err: any) {
            console.error("Error fetching facilities:", err)
            toast.error(err.message || "Failed to load facilities")
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

        if ((actionModal.type === 'suspend' || actionModal.type === 'revoke') && !actionModal.reason) {
            toast.error("Please provide a reason for this administrative action.")
            return
        }

        setActionModal(prev => ({ ...prev, submitting: true }))

        try {
            const newStatus =
                actionModal.type === 'approve' ? 'active' :
                    actionModal.type === 'reinstate' ? 'active' :
                        actionModal.type === 'suspend' ? 'suspended' : 'revoked'

            let registrationNumber = actionModal.facility.registration_number
            let idAssignedLog = ""
            // Assign category-specific standardized ID if not already standardized
            if (actionModal.type === 'approve' && (!registrationNumber || !registrationNumber.startsWith('NIC/'))) {
                const year = new Date().getFullYear()
                const random = Math.random().toString(36).substring(2, 7).toUpperCase()
                let prefix = 'FAC'
                if (actionModal.facility.facility_type === 'training_agency') prefix = 'TRN'
                else if (actionModal.facility.facility_type === 'agency') prefix = 'AGY'

                registrationNumber = `NIC/${prefix}/${year}/${random}`
                idAssignedLog = ` and assigned standardized ID: ${registrationNumber}`
            }

            const { error } = await supabase
                .from('facilities')
                .update({
                    status: newStatus,
                    registration_number: registrationNumber,
                    updated_at: new Date().toISOString()
                })
                .eq('id', actionModal.facility.id)

            if (error) throw error

            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('registry_actions').insert({
                target_type: 'facility',
                target_id: actionModal.facility.id,
                action_type: actionModal.type,
                reason: actionModal.reason || `Administrative status update to ${newStatus}${idAssignedLog}`,
                performed_by: user?.id
            })

            toast.success(`Facility marked as ${newStatus}`)
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
                    "",
                    emailStatusMap[actionModal.type] || 'action_required',
                    actionModal.reason,
                    registrationNumber
                )
            }
        } catch (err: any) {
            console.error("Error updating facility status:", err)
            toast.error(err.message || "Failed to update status")
        } finally {
            setActionModal(prev => ({ ...prev, submitting: false }))
        }
    }

    const handleInspectionSubmit = async () => {
        if (!inspectionModal.facility || !inspectionModal.date || !inspectionModal.time) {
            toast.error("Please fill in all inspection details.")
            return
        }

        setInspectionModal(prev => ({ ...prev, submitting: true }))

        try {
            const { error: updateError } = await supabase
                .from('facilities')
                .update({
                    next_inspection_date: inspectionModal.date,
                    status: 'pending_inspection',
                    updated_at: new Date().toISOString()
                })
                .eq('id', inspectionModal.facility.id)

            if (updateError) throw updateError

            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('registry_actions').insert({
                target_type: 'facility',
                target_id: inspectionModal.facility.id,
                action_type: 'schedule_inspection',
                reason: `Inspection scheduled for ${inspectionModal.date} at ${inspectionModal.time}. Notes: ${inspectionModal.notes || 'None'}`,
                performed_by: user?.id
            })

            if (inspectionModal.facility.email) {
                await sendInspectionScheduledAction(
                    inspectionModal.facility.email,
                    inspectionModal.facility.name,
                    "",
                    inspectionModal.date,
                    inspectionModal.time,
                    inspectionModal.inspector
                )
            }

            toast.success("Inspection scheduled and notification email sent!")
            setInspectionModal({ isOpen: false, facility: null, date: "", time: "10:00", inspector: "NIC Regional Inspector", notes: "", submitting: false })
            await fetchFacilities()
        } catch (err: any) {
            console.error("Error scheduling inspection:", err)
            toast.error(err.message || "Failed to schedule inspection")
        } finally {
            setInspectionModal(prev => ({ ...prev, submitting: false }))
        }
    }

    const handleAssignId = async (facilityId: string) => {
        setAssigningId(facilityId)
        try {
            const result = await assignFacilityIdAction(facilityId)
            if (result.success) {
                toast.success(`Standardized Registration ID assigned: ${result.registration_number}`)
                await fetchFacilities()
            } else {
                toast.error(result.error || "Failed to assign ID")
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred")
        } finally {
            setAssigningId(null)
        }
    }

    // Filter by Search Query AND Institutional Category
    const filteredFacilities = facilities.filter(f => {
        const matchesSearch =
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.email?.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        if (typeFilter === 'all') return true
        if (typeFilter === 'training') return f.facility_type === 'training_agency'
        if (typeFilter === 'agency') return f.facility_type === 'agency'
        if (typeFilter === 'care_facilities') return ['hospital', 'rehab', 'home_care', 'nursing_home', 'care_home', 'clinic'].includes(f.facility_type)

        return true
    })

    // Friendly Institutional Category Label & Styling
    const getCategoryBadge = (facilityType: string) => {
        switch (facilityType) {
            case 'training_agency':
                return (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-medium text-[11px] gap-1">
                        <GraduationCap className="h-3 w-3" /> Training Provider
                    </Badge>
                )
            case 'agency':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium text-[11px] gap-1">
                        <Briefcase className="h-3 w-3" /> Care Placement Agency
                    </Badge>
                )
            case 'home_care':
                return (
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-medium text-[11px] gap-1">
                        <Home className="h-3 w-3" /> Home Care
                    </Badge>
                )
            case 'rehab':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-[11px] gap-1">
                        <Activity className="h-3 w-3" /> Rehabilitation Center
                    </Badge>
                )
            case 'hospital':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-[11px] gap-1">
                        <Building2 className="h-3 w-3" /> Hospital / Clinical
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium text-[11px] capitalize">
                        {facilityType?.replace(/_/g, ' ') || 'Care Facility'}
                    </Badge>
                )
        }
    }

    // Accurate Semantic Status Badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active & Accredited
                    </span>
                )
            case 'pending_inspection':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Calendar className="h-3 w-3 text-amber-500" />
                        Pending Inspection
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <Clock className="h-3 w-3 text-sky-500" />
                        Awaiting Review
                    </span>
                )
            case 'suspended':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        Suspended
                    </span>
                )
            case 'revoked':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldOff className="h-3 w-3 text-rose-500" />
                        Revoked
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {status}
                    </span>
                )
        }
    }

    return (
        <div className="w-full max-w-full min-w-0 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">Institutional Registry</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Accredited training providers, care placement agencies, and clinical care facilities
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-600 font-medium"
                        onClick={() => window.location.href = '/admin/registry/caregivers/audit-trail'}
                    >
                        <History className="mr-1.5 h-4 w-4" />
                        Audit Trail
                    </Button>
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white font-medium"
                        onClick={() => window.location.href = '/admin/members?category=facility_admin'}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Facility
                    </Button>
                </div>
            </div>

            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Institutions</span>
                            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                <Building2 className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-serif">{stats.total}</p>
                        <p className="text-xs text-slate-500 mt-1">Accredited & in-process</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white hover:border-emerald-200 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active & Accredited</span>
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 font-serif">{stats.active}</p>
                        <p className="text-xs text-slate-500 mt-1">In full regulatory standing</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white hover:border-amber-200 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Inspection</span>
                            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2 font-serif">{stats.pendingInspection}</p>
                        <p className="text-xs text-slate-500 mt-1">Inspection visit scheduled</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white hover:border-sky-200 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting Review</span>
                            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-sky-600 mt-2 font-serif">{stats.pendingReview}</p>
                        <p className="text-xs text-slate-500 mt-1">Awaiting admin action</p>
                    </CardContent>
                </Card>
            </div>

            {/* Categorization Tabs & Search Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${typeFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        All Institutions ({facilities.length})
                    </button>
                    <button
                        onClick={() => setTypeFilter('training')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${typeFilter === 'training'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                    >
                        <GraduationCap className="h-3.5 w-3.5" />
                        Training Providers ({facilities.filter(f => f.facility_type === 'training_agency').length})
                    </button>
                    <button
                        onClick={() => setTypeFilter('agency')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${typeFilter === 'agency'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                    >
                        <Briefcase className="h-3.5 w-3.5" />
                        Placement Agencies ({facilities.filter(f => f.facility_type === 'agency').length})
                    </button>
                    <button
                        onClick={() => setTypeFilter('care_facilities')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${typeFilter === 'care_facilities'
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50'
                            }`}
                    >
                        <Building2 className="h-3.5 w-3.5" />
                        Care Homes & Clinics ({facilities.filter(f => ['hospital', 'rehab', 'home_care', 'nursing_home', 'care_home', 'clinic'].includes(f.facility_type)).length})
                    </button>
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by facility name, registration code, city, state, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-8 text-sm h-10 border-slate-200 focus-visible:ring-primary"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        >
                            <option value="all">All Registry Statuses</option>
                            <option value="active">Active & Accredited</option>
                            <option value="pending_inspection">Pending Inspection</option>
                            <option value="pending">Awaiting Review</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Registry Table Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4 font-semibold">Institution Name</th>
                                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">NIC Code</th>
                                <th className="py-3.5 px-4 font-semibold">Location</th>
                                <th className="py-3.5 px-4 font-semibold">Capacity / Scope</th>
                                <th className="py-3.5 px-4 font-semibold">Registry Status</th>
                                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                                        <p className="text-xs">Loading institutional registry...</p>
                                    </td>
                                </tr>
                            ) : filteredFacilities.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-25" />
                                        <p className="font-medium text-slate-700">No institutions found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your category tabs or search query.</p>
                                    </td>
                                </tr>
                            ) : filteredFacilities.map((f) => {
                                const isStandardized = Boolean(f.registration_number && f.registration_number.startsWith('NIC/'))

                                return (
                                    <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Institution Column */}
                                        <td className="py-3.5 px-4">
                                            <div className="space-y-1">
                                                <button
                                                    onClick={() => setSelectedFacilityId(f.id)}
                                                    className="font-bold text-slate-900 hover:text-primary transition-colors text-left line-clamp-1"
                                                >
                                                    {f.name}
                                                </button>
                                                <div>{getCategoryBadge(f.facility_type)}</div>
                                            </div>
                                        </td>

                                        {/* NIC Code Column */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            {isStandardized ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                        {f.registration_number}
                                                    </span>
                                                    <span title="Standardized NIC Registration">
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <span className="font-mono text-xs text-slate-500 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 inline-block">
                                                        {f.registration_number || 'Unassigned'}
                                                    </span>
                                                    <p className="text-[10px] text-amber-700 font-medium">Pending NIC Code</p>
                                                </div>
                                            )}
                                        </td>

                                        {/* Location Column */}
                                        <td className="py-3.5 px-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1 text-xs text-slate-800 font-medium">
                                                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                                    <span>{f.city || 'Lagos'}, {f.state || 'Lagos'}</span>
                                                </div>
                                                {f.phone && (
                                                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                                        <Phone className="h-2.5 w-2.5" /> {f.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Capacity & Scope Column */}
                                        <td className="py-3.5 px-4">
                                            <div className="space-y-1">
                                                {f.capacity && f.capacity > 0 ? (
                                                    <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                                                        <Users className="h-3 w-3 text-slate-400" />
                                                        {f.capacity} {f.facility_type === 'training_agency' ? 'Learners' : 'Capacity'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Unspecified</span>
                                                )}

                                                {/* Curriculum Status for Training Providers */}
                                                {f.facility_type === 'training_agency' && (
                                                    <div>
                                                        {f.curriculum_status === 'approved' ? (
                                                            <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                                                                <Check className="h-2.5 w-2.5 mr-0.5" /> Curriculum Approved
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                                                Curriculum In Review
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status Column */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            {getStatusBadge(f.status)}
                                        </td>

                                        {/* Actions Column (Compact & Contained) */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs font-medium border-slate-200 text-slate-700 hover:text-primary hover:border-primary/40 bg-white"
                                                    onClick={() => setSelectedFacilityId(f.id)}
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                                    View Details
                                                </Button>

                                                {/* Actions Dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuLabel className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                                            Institutional Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setSelectedFacilityId(f.id)}>
                                                            <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                            View Full Dossier
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => setInspectionModal({
                                                                isOpen: true,
                                                                facility: f,
                                                                date: f.next_inspection_date || "",
                                                                time: "10:00",
                                                                inspector: "NIC Regional Inspector",
                                                                notes: "",
                                                                submitting: false
                                                            })}
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                                                            Schedule Inspection
                                                        </DropdownMenuItem>

                                                        {/* Only offer Standardize ID if NOT already standardized */}
                                                        {!isStandardized && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleAssignId(f.id)}
                                                                disabled={assigningId === f.id}
                                                                className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50"
                                                            >
                                                                {assigningId === f.id ? (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <FileCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                                                )}
                                                                Assign Standard NIC Code
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />

                                                        {/* Status Management Actions */}
                                                        {(f.status === 'pending' || f.status === 'pending_inspection') && (
                                                            <DropdownMenuItem
                                                                onClick={() => openActionModal(f, 'approve')}
                                                                className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50"
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                                                Approve Accreditation
                                                            </DropdownMenuItem>
                                                        )}

                                                        {f.status === 'active' && (
                                                            <DropdownMenuItem
                                                                onClick={() => openActionModal(f, 'suspend')}
                                                                className="text-orange-700 focus:text-orange-800 focus:bg-orange-50"
                                                            >
                                                                <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
                                                                Suspend Facility
                                                            </DropdownMenuItem>
                                                        )}

                                                        {f.status === 'suspended' && (
                                                            <DropdownMenuItem
                                                                onClick={() => openActionModal(f, 'reinstate')}
                                                                className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50"
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                                                Reinstate Facility
                                                            </DropdownMenuItem>
                                                        )}

                                                        {f.email && (
                                                            <DropdownMenuItem asChild>
                                                                <a href={`mailto:${f.email}`}>
                                                                    <Mail className="mr-2 h-4 w-4 text-slate-500" />
                                                                    Email Administrator
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            onClick={() => openActionModal(f, 'revoke')}
                                                            className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                                        >
                                                            <ShieldOff className="mr-2 h-4 w-4" />
                                                            Revoke Accreditation
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal (Approve / Suspend / Reinstate / Revoke) */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl bg-white border border-slate-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                                {actionModal.type === 'approve' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                                {actionModal.type === 'suspend' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                                {actionModal.type === 'revoke' && <ShieldOff className="h-5 w-5 text-rose-600" />}
                                {actionModal.type === 'reinstate' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                                <span className="capitalize">{actionModal.type} Institution</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                {actionModal.type === 'approve' ? "Grant full accredited standing to this institution." :
                                    actionModal.type === 'suspend' ? "Temporarily suspend operational privileges on the national registry." :
                                        actionModal.type === 'revoke' ? "Revoke institutional accreditation. This action is recorded immutably in the registry audit trail." :
                                            "Restore active accredited standing."}
                            </p>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-900 truncate">{actionModal.facility?.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{actionModal.facility?.registration_number || 'No Registration Code'}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Administrative Reason & Notes {actionModal.type === 'suspend' || actionModal.type === 'revoke' ? '*' : '(Optional)'}
                                </label>
                                <textarea
                                    className="w-full h-28 p-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none outline-none"
                                    placeholder={
                                        actionModal.type === 'approve' ? "Extra feedback or accreditation terms for the institution owner..." :
                                            actionModal.type === 'suspend' ? "Specify reason for suspension (e.g., pending re-inspection of caregiver supervision standards)..." :
                                                actionModal.type === 'revoke' ? "Specify reason for revocation (e.g., severe non-compliance with NIC standards)..." :
                                                    "Reason for reinstatement..."
                                    }
                                    value={actionModal.reason}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                                />
                                <p className="text-[11px] text-slate-500 italic">
                                    The facility administrator will be notified automatically via email.
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1 font-medium"
                                    variant="outline"
                                    onClick={() => setActionModal({ isOpen: false, facility: null, type: null, reason: "", submitting: false })}
                                    disabled={actionModal.submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`flex-1 text-white font-medium ${actionModal.type === 'approve' || actionModal.type === 'reinstate'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : actionModal.type === 'suspend'
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'bg-rose-600 hover:bg-rose-700'
                                        }`}
                                    onClick={handleActionSubmit}
                                    disabled={actionModal.submitting}
                                >
                                    {actionModal.submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        `Confirm ${actionModal.type}`
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Inspection Scheduling Modal */}
            {inspectionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl bg-white border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-amber-500" />
                                    Schedule Compliance Inspection
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Assign an inspection date and notify the institution.
                                </p>
                            </div>
                            <button
                                onClick={() => setInspectionModal(prev => ({ ...prev, isOpen: false }))}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <p className="font-bold text-sm text-slate-800">{inspectionModal.facility?.name}</p>
                                <p className="text-xs text-slate-500">
                                    {inspectionModal.facility?.city}, {inspectionModal.facility?.state} &bull; {inspectionModal.facility?.email}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Inspection Date *
                                    </label>
                                    <Input
                                        type="date"
                                        value={inspectionModal.date}
                                        onChange={(e) => setInspectionModal(prev => ({ ...prev, date: e.target.value }))}
                                        className="text-sm h-10"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Inspection Time *
                                    </label>
                                    <Input
                                        type="time"
                                        value={inspectionModal.time}
                                        onChange={(e) => setInspectionModal(prev => ({ ...prev, time: e.target.value }))}
                                        className="text-sm h-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Assigned Inspector
                                </label>
                                <Input
                                    value={inspectionModal.inspector}
                                    onChange={(e) => setInspectionModal(prev => ({ ...prev, inspector: e.target.value }))}
                                    placeholder="Inspector name or team"
                                    className="text-sm h-10"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Inspection Directives / Notes
                                </label>
                                <textarea
                                    className="w-full h-20 p-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none outline-none"
                                    placeholder="e.g. Ensure lead caregiver supervisor and patient records are on-site..."
                                    value={inspectionModal.notes}
                                    onChange={(e) => setInspectionModal(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={() => setInspectionModal(prev => ({ ...prev, isOpen: false }))}
                                    disabled={inspectionModal.submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium"
                                    onClick={handleInspectionSubmit}
                                    disabled={inspectionModal.submitting}
                                >
                                    {inspectionModal.submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scheduling...
                                        </>
                                    ) : (
                                        "Confirm & Notify"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Facility Details Sheet */}
            <FacilityDetailsSheet
                facilityId={selectedFacilityId}
                isOpen={!!selectedFacilityId}
                onClose={() => setSelectedFacilityId(null)}
            />
        </div>
    )
}
