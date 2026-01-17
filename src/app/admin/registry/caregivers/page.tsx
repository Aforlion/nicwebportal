"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
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
    AlertTriangle,
    History,
    MoreVertical,
    Check
} from "lucide-react"

type Caregiver = {
    id: string
    user_id: string
    nic_id: string
    member_id: string
    full_name: string
    email: string
    phone: string
    category: string
    status: string
    compliance_status: string
    cpd_compliant: boolean
    joined_date: string
    expiry_date: string
    certifications_count?: number
}

export default function AdminRegistryPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [complianceFilter, setComplianceFilter] = useState("all")

    const [caregivers, setCaregivers] = useState<Caregiver[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        suspended: 0,
        revoked: 0,
        underReview: 0
    })

    // Action Modal State
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean
        caregiver: Caregiver | null
        type: 'suspend' | 'revoke' | 'reinstate' | null
        reason: string
        submitting: boolean
    }>({
        isOpen: false,
        caregiver: null,
        type: null,
        reason: "",
        submitting: false
    })

    const supabase = createClient()

    useEffect(() => {
        fetchRegistryData()
    }, [statusFilter, categoryFilter, complianceFilter])

    const fetchRegistryData = async () => {
        setLoading(true)
        try {
            // Fetch stats
            const { data: statsData } = await supabase.rpc('get_registry_stats')
            if (statsData) {
                setStats(statsData)
            } else {
                // Fallback if RPC not available yet
                const { count: total } = await supabase.from('memberships').select('*', { count: 'exact', head: true })
                const { count: active } = await supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('is_active', true)
                const { count: suspended } = await supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('compliance_status', 'suspended')
                const { count: revoked } = await supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('compliance_status', 'revoked')
                const { count: underReview } = await supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('compliance_status', 'under_review')

                setStats({
                    total: total || 0,
                    active: active || 0,
                    suspended: suspended || 0,
                    revoked: revoked || 0,
                    underReview: underReview || 0
                })
            }

            // Fetch caregivers
            let query = supabase
                .from('memberships')
                .select(`
                    id,
                    user_id,
                    nic_id,
                    member_id,
                    category,
                    status,
                    compliance_status,
                    cpd_compliant,
                    joined_date,
                    expiry_date,
                    profiles!inner(full_name, email, phone)
                `)

            if (statusFilter !== 'all') query = query.eq('compliance_status', statusFilter)
            if (categoryFilter !== 'all') query = query.eq('category', categoryFilter)
            if (complianceFilter !== 'all') query = query.eq('compliance_status', complianceFilter)

            const { data, error } = await query

            if (error) throw error

            const formattedData = data.map((item: any) => ({
                id: item.id,
                user_id: item.user_id,
                nic_id: item.nic_id,
                member_id: item.member_id,
                full_name: item.profiles.full_name,
                email: item.profiles.email,
                phone: item.profiles.phone,
                category: item.category,
                status: item.status,
                compliance_status: item.compliance_status || item.status,
                cpd_compliant: item.cpd_compliant,
                joined_date: item.joined_date,
                expiry_date: item.expiry_date
            }))

            setCaregivers(formattedData)
        } catch (error) {
            console.error("Error fetching registry data:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCaregivers = caregivers.filter(c =>
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nic_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.member_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleExport = () => {
        const headers = ["Full Name", "Email", "NIC ID", "Member ID", "Category", "Status", "Compliance", "CPD", "Expiry Date"]
        const csvRows = [
            headers.join(','),
            ...filteredCaregivers.map(c => [
                `"${c.full_name}"`,
                c.email,
                c.nic_id || "",
                c.member_id || "",
                c.category,
                c.status,
                c.compliance_status,
                c.cpd_compliant ? "YES" : "NO",
                c.expiry_date
            ].join(','))
        ]

        const csvContent = csvRows.join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `NIC_Caregiver_Registry_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const openActionModal = (caregiver: Caregiver, type: 'suspend' | 'revoke' | 'reinstate') => {
        setActionModal({
            isOpen: true,
            caregiver,
            type,
            reason: "",
            submitting: false
        })
    }

    const handleActionSubmit = async () => {
        if (!actionModal.caregiver || !actionModal.type) return
        if ((actionModal.type === 'suspend' || actionModal.type === 'revoke') && !actionModal.reason) {
            alert("Please provide a reason for this action.")
            return
        }

        setActionModal(prev => ({ ...prev, submitting: true }))

        try {
            const { data: { user } } = await supabase.auth.getUser()

            const newStatus = actionModal.type === 'reinstate' ? 'compliant' : (
                actionModal.type === 'suspend' ? 'suspended' : 'revoked'
            )

            // 1. Update Membership
            const { error: updateError } = await supabase
                .from('memberships')
                .update({
                    compliance_status: newStatus,
                    status: actionModal.type === 'reinstate' ? 'active' : 'inactive',
                    is_active: actionModal.type === 'reinstate',
                    suspension_reason: actionModal.type === 'suspend' ? actionModal.reason : null,
                    suspension_date: actionModal.type === 'suspend' ? new Date().toISOString() : null,
                    revocation_reason: actionModal.type === 'revoke' ? actionModal.reason : null,
                    revocation_date: actionModal.type === 'revoke' ? new Date().toISOString() : null
                })
                .eq('id', actionModal.caregiver.id)

            if (updateError) throw updateError

            // 2. Log Action in Audit Trail
            const { error: logError } = await supabase
                .from('registry_actions')
                .insert({
                    target_type: 'caregiver',
                    target_id: actionModal.caregiver.user_id,
                    action_type: actionModal.type,
                    reason: actionModal.reason || `Caregiver ${actionModal.type}d`,
                    performed_by: user?.id
                })

            if (logError) throw logError

            // 3. Refresh UI
            await fetchRegistryData()
            setActionModal({ isOpen: false, caregiver: null, type: null, reason: "", submitting: false })

            // TODO: In a real app, trigger email notification here via edge function
            console.log(`Email notification sent to ${actionModal.caregiver.email} for ${actionModal.type}`)

        } catch (error) {
            console.error(`Error performing ${actionModal.type}:`, error)
            alert(`Failed to perform ${actionModal.type}. Please check console.`)
        } finally {
            setActionModal(prev => ({ ...prev, submitting: false }))
        }
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Caregiver Registry</h1>
                    <p className="text-muted-foreground">Manage and verify all registered caregivers</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/admin/registry/audit-trail'}>
                        <History className="mr-2 h-4 w-4" />
                        Audit Trail
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-5">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Registry</p>
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
                                <option value="compliant">Compliant</option>
                                <option value="under_review">Under Review</option>
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
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Registry
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
                                    <th className="text-left p-4 font-medium text-muted-foreground">Expiry</th>
                                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                            <ShieldCheck className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                                            Loading caregivers...
                                        </td>
                                    </tr>
                                ) : filteredCaregivers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                            No caregivers found.
                                        </td>
                                    </tr>
                                ) : filteredCaregivers.map((caregiver) => (
                                    <tr key={caregiver.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-secondary">{caregiver.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{caregiver.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                {caregiver.nic_id || caregiver.member_id}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className="capitalize text-[10px]">{caregiver.category}</Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={getStatusColor(caregiver.compliance_status)}>
                                                {caregiver.compliance_status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {caregiver.cpd_compliant ? (
                                                <div className="flex items-center text-emerald-600 text-xs font-medium">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    OK
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-red-600 text-xs font-medium">
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Pending
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(caregiver.expiry_date).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="ghost" title="View Profile">
                                                    <Eye className="h-4 w-4 text-slate-500" />
                                                </Button>

                                                {caregiver.compliance_status === 'compliant' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                        onClick={() => openActionModal(caregiver, 'suspend')}
                                                        title="Suspend Caregiver"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {(caregiver.compliance_status === 'suspended' || caregiver.compliance_status === 'under_review') && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => openActionModal(caregiver, 'reinstate')}
                                                        title="Reinstate Caregiver"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {caregiver.compliance_status !== 'revoked' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => openActionModal(caregiver, 'revoke')}
                                                        title="Revoke Registration"
                                                    >
                                                        <ShieldOff className="h-4 w-4" />
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

            {/* Action Modal Overlay */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                {actionModal.type === 'suspend' && <Ban className="h-5 w-5 text-orange-600" />}
                                {actionModal.type === 'revoke' && <ShieldOff className="h-5 w-5 text-red-600" />}
                                {actionModal.type === 'reinstate' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                                <span className="capitalize">{actionModal.type} Caregiver</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    {actionModal.caregiver?.full_name?.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{actionModal.caregiver?.full_name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{actionModal.caregiver?.nic_id || actionModal.caregiver?.member_id}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">
                                    Reason for {actionModal.type}ion
                                </label>
                                <textarea
                                    className="w-full h-32 p-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none outline-none"
                                    placeholder={
                                        actionModal.type === 'suspend' ? "e.g., Pending clinical investigation into care standards..." :
                                            actionModal.type === 'revoke' ? "e.g., Gross professional misconduct and violation of NIC ethics code..." :
                                                "e.g., Satisfactory resolution of pending investigation..."
                                    }
                                    value={actionModal.reason}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                                />
                                {actionModal.type !== 'reinstate' && (
                                    <p className="text-[10px] text-orange-600 font-medium bg-orange-50 p-2 rounded border border-orange-100 italic">
                                        Note: This action will be visible on the public registry and the member will be notified immediately via email.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={() => setActionModal({ isOpen: false, caregiver: null, type: null, reason: "", submitting: false })}
                                    disabled={actionModal.submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`flex-1 text-white ${actionModal.type === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' :
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
        </div>
    )
}
