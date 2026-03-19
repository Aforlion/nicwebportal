"use client"

import { useState, Suspense } from "react"
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
    Clock,
    UserPlus,
    Mail,
    Copy,
    ExternalLink,
    Loader2
} from "lucide-react"
import { NIC_FOUNDERS } from "@/constants/founders"
import { createClient } from "@/lib/supabase"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import { getMembers } from "@/actions/admin/get-members"
import { useEffect } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { sendFoundingInvitationAction } from "@/lib/actions/registration"

import { useSearchParams } from "next/navigation"
import { MemberDetailsSheet } from "@/components/admin/member-details-sheet"

function AdminMembersContent() {
    const searchParams = useSearchParams()
    const urlCategory = searchParams.get("category")
    const urlStatus = searchParams.get("status")

    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState(urlStatus || "all")
    const [categoryFilter, setCategoryFilter] = useState(urlCategory || "all")
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

    useEffect(() => {
        loadMembers()
    }, [])

    // Sync state with URL params if they change
    useEffect(() => {
        if (urlCategory) setCategoryFilter(urlCategory)
        if (urlStatus) setStatusFilter(urlStatus)
    }, [urlCategory, urlStatus])

    async function loadMembers() {
        setLoading(true)
        const result = await getMembers()
        if (result.error) {
            toast.error(result.error)
        } else {
            setMembers(result.members || [])
        }
        setLoading(false)
    }

    const filteredMembers = members.filter(member => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.memberID.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || member.status.toLowerCase() === statusFilter.toLowerCase()
        const matchesCategory = categoryFilter === "all" || member.category.toLowerCase() === categoryFilter.toLowerCase()

        return matchesSearch && matchesStatus && matchesCategory
    })

    const pageTitle = categoryFilter === 'student' ? "Student Management" : "Member Management"
    const pageDescription = categoryFilter === 'student' ? "View and manage all registered NIC students" : "View and manage all professional NIC members"

    const stats = {
        total: filteredMembers.length,
        active: filteredMembers.filter(m => m.status.toLowerCase() === 'active').length,
        pending: filteredMembers.filter(m => m.status.toLowerCase() === 'pending').length,
        suspended: filteredMembers.filter(m => m.status.toLowerCase() === 'suspended').length
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 font-medium"><CheckCircle2 className="h-3 w-3 mr-1" />{status}</Badge>
            case "Pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600 font-medium"><Clock className="h-3 w-3 mr-1" />{status}</Badge>
            case "Suspended":
                return <Badge className="bg-red-500 hover:bg-red-600 font-medium"><XCircle className="h-3 w-3 mr-1" />{status}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">{pageTitle}</h1>
                    <p className="text-slate-500 mt-1">{pageDescription}</p>
                </div>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Invite Founder
                            </Button>
                        </DialogTrigger>
                        <InviteFounderModal />
                    </Dialog>
                    <Button variant="outline" className="bg-white border-slate-200">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <Users className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total {categoryFilter === 'student' ? 'Students' : 'Members'}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center relative">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <CheckCircle2 className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <Clock className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <XCircle className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspended</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{stats.suspended}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="p-6 border-b border-slate-100 flex flex-col gap-4 lg:flex-row lg:items-center bg-slate-50/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search by name, email, or member ID..."
                                className="pl-10 bg-white border-slate-200 w-full shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                            >
                                <option value="all">All Categories</option>
                                <option value="student">Student</option>
                                <option value="professional">Professional</option>
                                <option value="associate">Associate</option>
                                <option value="full">Professional Member</option>
                                <option value="trainer">Trainer</option>
                                <option value="institutional">Institutional</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/30 mb-4" />
                            <p className="text-slate-400 animate-pulse font-medium">Updating member list...</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Cards */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {filteredMembers.map((member) => (
                                    <div key={member.id} className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold bg-primary/10 text-primary">
                                                    {member.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{member.name}</p>
                                                    <p className="text-xs text-slate-500">{member.memberID}</p>
                                                </div>
                                            </div>
                                            {getStatusBadge(member.status)}
                                        </div>
                                        <div className="flex items-center justify-between text-xs pt-2">
                                            <div className="space-y-1">
                                                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Category</p>
                                                <p className="font-medium text-slate-700 capitalize">{member.category}</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Joined</p>
                                                <p className="font-medium text-slate-700">{format(new Date(member.joinDate), 'MMM yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-2 h-9"
                                                onClick={() => setSelectedMemberId(member.id)}
                                            >
                                                <Eye className="h-4 w-4" /> View Profile
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1 gap-2 h-9" asChild>
                                                <a href={`mailto:${member.email}`}>
                                                    <Mail className="h-4 w-4" /> Message
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50/50 text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Member Details</th>
                                            <th className="px-6 py-4 font-bold">ID / Category</th>
                                            <th className="px-6 py-4 font-bold text-center">Status</th>
                                            <th className="px-6 py-4 font-bold text-center">Joined Date</th>
                                            <th className="px-6 py-4 text-right font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredMembers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                                        <Search className="h-10 w-10 opacity-20" />
                                                        <p className="text-sm font-medium">No results found matching your filters</p>
                                                        <Button variant="link" className="text-primary" onClick={() => {
                                                            setSearchQuery("")
                                                            setCategoryFilter("all")
                                                            setStatusFilter("all")
                                                        }}>
                                                            Reset all filters
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredMembers.map((member) => (
                                                <tr key={member.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold bg-primary/10 text-primary transition-transform group-hover:scale-105">
                                                                {member.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{member.name}</p>
                                                                <p className="text-xs text-slate-400">{member.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-mono text-xs font-medium text-slate-600 tracking-tight">{member.memberID}</p>
                                                        <Badge variant="outline" className="mt-1 font-normal text-[10px] bg-slate-50 border-slate-200 text-slate-500 capitalize px-1.5 py-0">
                                                            {member.category === 'full' ? 'professional' : member.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{getStatusBadge(member.status)}</td>
                                                    <td className="px-6 py-4 text-slate-500 font-medium text-center">
                                                        {format(new Date(member.joinDate), 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full"
                                                                onClick={() => setSelectedMemberId(member.id)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full"
                                                                asChild
                                                            >
                                                                <a href={`mailto:${member.email}`}>
                                                                    <Mail className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <MemberDetailsSheet
                membershipId={selectedMemberId}
                onClose={() => setSelectedMemberId(null)}
                onStatusUpdate={loadMembers}
            />
        </div>
    )
}

function InviteFounderModal() {
    const [email, setEmail] = useState("")
    const [selectedFounder, setSelectedFounder] = useState("")
    const [loading, setLoading] = useState(false)
    const [inviteLink, setInviteLink] = useState("")

    const handleInvite = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

            const { error } = await supabase
                .from('membership_invitations')
                .insert({
                    email,
                    full_name: selectedFounder,
                    token,
                    category: 'full'
                })

            if (error) throw error

            const link = `${window.location.origin}/onboard/founding?token=${token}`
            setInviteLink(link)

            // 4. Send Automated Invitation Email
            await sendFoundingInvitationAction(email, selectedFounder, link)
            toast.success("Invitation generated and email sent!")

        } catch (err: any) {
            toast.error(err.message || "Failed to create invitation")
        } finally {
            setLoading(false)
        }
    }


    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Invite Founding Member</DialogTitle>
                <DialogDescription>
                    Select a founder from the official list and provide their email to generate an onboarding link.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="founder">Select Founder Name</Label>
                    <select
                        id="founder"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedFounder}
                        onChange={(e) => setSelectedFounder(e.target.value)}
                    >
                        <option value="">-- Choose Founder --</option>
                        {NIC_FOUNDERS.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="founder@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {inviteLink && (
                    <div className="mt-4 p-4 bg-muted rounded-lg border space-y-2">
                        <Label className="text-xs uppercase text-muted-foreground">Onboarding Link</Label>
                        <div className="flex gap-2">
                            <Input value={inviteLink} readOnly className="bg-white" />
                            <Button size="icon" variant="outline" onClick={() => {
                                navigator.clipboard.writeText(inviteLink)
                            }}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Send this link to the founder to complete their registration, pay dues, and upload KYC.
                        </p>
                    </div>
                )}
            </div>
            <DialogFooter>
                {!inviteLink ? (
                    <Button
                        onClick={handleInvite}
                        disabled={loading || !email || !selectedFounder}
                        className="w-full bg-primary"
                    >
                        {loading ? "Generating..." : "Generate Invitation Link"}
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full" onClick={() => {
                        setInviteLink("")
                        setEmail("")
                        setSelectedFounder("")
                    }}>
                        Create Another
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    )
}

export default function AdminMembersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <AdminMembersContent />
        </Suspense>
    )
}
