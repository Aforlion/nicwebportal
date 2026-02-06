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
    Clock,
    UserPlus,
    Mail,
    Copy,
    ExternalLink
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Member Management</h1>
                    <p className="text-slate-500">View and manage all NIC members</p>
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
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Members</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">1,247</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-1">1,189</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">42</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspended</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">16</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="p-6 border-b border-slate-100 flex flex-col gap-4 md:flex-row md:items-center bg-slate-50/50">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search by name, email, or member ID..."
                                className="pl-10 bg-white border-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Categories</option>
                                <option value="student">Student</option>
                                <option value="associate">Associate</option>
                                <option value="full">Full Member</option>
                                <option value="trainer">Trainer</option>
                                <option value="institutional">Institutional</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Member</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">ID / Category</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Joined Date</th>
                                    <th className="px-6 py-4 text-right font-bold tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${member.id % 2 === 0 ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                                                    }`}>
                                                    {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{member.name}</p>
                                                    <p className="text-xs text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-xs font-medium text-slate-600">{member.memberID}</p>
                                            <Badge variant="outline" className="mt-1 font-normal text-xs bg-slate-50 border-slate-200 text-slate-600">
                                                {member.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{member.joinDate}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                                                    <Mail className="h-4 w-4" />
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
        } catch (err: any) {
            alert(err.message || "Failed to create invitation")
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
