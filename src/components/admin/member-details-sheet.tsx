"use client"

import { useState, useEffect } from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import {
    User,
    Mail,
    Phone,
    Calendar,
    Award,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    CreditCard,
    History,
    Shield,
    Loader2
} from "lucide-react"
import { format } from "date-fns"
import { getMemberDetails } from "@/actions/admin/get-member-details"
import { updateMemberStatusAction } from "@/actions/admin/update-member-status"
import { admitMemberAction } from "@/actions/admin/admit-member"
import { sendProfileUpdateRequestAction } from "@/actions/admin/send-update-request"
import { toast } from "sonner"

interface MemberDetailsSheetProps {
    membershipId: string | null
    onClose: () => void
    onStatusUpdate?: () => void
}

export function MemberDetailsSheet({ membershipId, onClose, onStatusUpdate }: MemberDetailsSheetProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [sendingUpdateRequest, setSendingUpdateRequest] = useState(false)

    useEffect(() => {
        if (membershipId) {
            loadDetails()
        }
    }, [membershipId])

    async function loadDetails() {
        setLoading(true)
        const result = await getMemberDetails(membershipId!)
        if (result.success) {
            setData(result.data)
        } else {
            toast.error(result.error || "Failed to load details")
            onClose()
        }
        setLoading(false)
    }

    async function handleStatusUpdate(newStatus: string) {
        setUpdating(true)
        const result = await updateMemberStatusAction(membershipId!, newStatus)
        if (result.success) {
            toast.success(`Member status updated to ${newStatus}`)
            await loadDetails()
            if (onStatusUpdate) onStatusUpdate()
        } else {
            toast.error(result.error || "Failed to update status")
        }
        setUpdating(false)
    }

    async function handleAdmit() {
        setUpdating(true)
        const result = await admitMemberAction(membershipId!)
        if (result.success) {
            toast.success("Member admitted successfully! Admission email sent.")
            await loadDetails()
            if (onStatusUpdate) onStatusUpdate()
        } else {
            toast.error(result.error || "Failed to admit member")
        }
        setUpdating(false)
    }

    async function handleSendUpdateRequest() {
        setSendingUpdateRequest(true)
        const result = await sendProfileUpdateRequestAction(membershipId!)
        if (result.success) {
            toast.success("Profile update request email sent successfully!")
        } else {
            toast.error(result.error || "Failed to send update request")
        }
        setSendingUpdateRequest(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
            case "pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
            case "suspended":
                return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Sheet open={!!membershipId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col">
                {/* Always-present hidden title satisfies Radix Dialog a11y requirement */}
                <SheetTitle className="sr-only">
                    {data?.profile?.full_name ?? "Member Details"}
                </SheetTitle>
                <SheetDescription className="sr-only">
                    Detailed profile, payments, documents and CPD records for this member.
                </SheetDescription>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-slate-500 animate-pulse">Fetching member records...</p>
                    </div>
                ) : data ? (
                    <>
                        <SheetHeader className="p-6 border-b bg-slate-50/50">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    {/* Visible title rendered inside SheetHeader (not using SheetTitle to avoid duplication) */}
                                    <p className="text-2xl font-bold font-serif" aria-hidden="true">{data.profile?.full_name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-slate-500 font-mono">{data.nic_id || "No ID assigned"}</p>
                                        <Badge variant="secondary" className="capitalize">{data.category}</Badge>
                                    </div>
                                </div>
                                {getStatusBadge(data.status)}
                            </div>
                        </SheetHeader>

                        <div className="flex-1 flex flex-col min-h-0">
                            <Tabs defaultValue="info" className="flex-1 flex flex-col">
                                <div className="px-6 border-b">
                                    <TabsList className="w-full justify-start bg-transparent border-none p-0 h-12">
                                        <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Info</TabsTrigger>
                                        <TabsTrigger value="payments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Payments</TabsTrigger>
                                        <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Documents</TabsTrigger>
                                        <TabsTrigger value="cpd" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">CPD/Activity</TabsTrigger>
                                    </TabsList>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="p-6 pb-24">
                                        <TabsContent value="info" className="m-0 space-y-6">
                                            <section className="space-y-4">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Details</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-slate-400">Email Address</Label>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail className="h-4 w-4 text-slate-400" />
                                                            {data.profile?.email}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-slate-400">Phone Number</Label>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-4 w-4 text-slate-400" />
                                                            {data.profile?.phone || "Not provided"}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-slate-400">Date of Birth</Label>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="h-4 w-4 text-slate-400" />
                                                            {data.date_of_birth ? format(new Date(data.date_of_birth), "PPP") : "N/A"}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-slate-400">Member Since</Label>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-4 w-4 text-slate-400" />
                                                            {format(new Date(data.created_at), "PPP")}
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="space-y-4">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Professional Profile</h3>
                                                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Award className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="text-sm font-semibold">{data.qualification || "Unspecified Qualification"}</p>
                                                            <p className="text-xs text-slate-500">{data.years_of_experience || 0} Years Experience</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="text-sm font-semibold">License Expiry</p>
                                                            <p className="text-xs text-slate-500">
                                                                {data.expiry_date ? format(new Date(data.expiry_date), "PPP") : "No Active License"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </TabsContent>

                                        <TabsContent value="payments" className="m-0 space-y-4">
                                            {data.payments.length === 0 ? (
                                                <div className="text-center py-10 text-slate-400">
                                                    <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                    <p>No payment records found</p>
                                                </div>
                                            ) : (
                                                data.payments.map((payment: any) => (
                                                    <div key={payment.id} className="border rounded-lg p-4 flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold">₦{payment.amount.toLocaleString()}</p>
                                                            <p className="text-xs text-slate-500 capitalize">{payment.payment_type} - {payment.status}</p>
                                                        </div>
                                                        <div className="text-right space-y-1">
                                                            <p className="text-xs text-slate-400">{format(new Date(payment.created_at), "MMM d, yyyy")}</p>
                                                            <p className="text-[10px] font-mono text-slate-300">{payment.transaction_reference}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </TabsContent>

                                        <TabsContent value="documents" className="m-0 space-y-4">
                                            {data.documents.length === 0 ? (
                                                <div className="text-center py-10 text-slate-400">
                                                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                    <p>No documents uploaded yet</p>
                                                </div>
                                            ) : (
                                                data.documents.map((doc: any) => (
                                                    <div key={doc.id} className="border rounded-lg p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-slate-400" />
                                                            <div>
                                                                <p className="text-sm font-medium">{doc.document_name}</p>
                                                                <p className="text-xs text-slate-500">{doc.document_type}</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a>
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </TabsContent>

                                        <TabsContent value="cpd" className="m-0 space-y-4">
                                            {data.cpd.length === 0 ? (
                                                <div className="text-center py-10 text-slate-400">
                                                    <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                    <p>No recent activities found</p>
                                                </div>
                                            ) : (
                                                data.cpd.map((activity: any) => (
                                                    <div key={activity.id} className="border rounded-lg p-4 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-sm font-semibold">{activity.title}</p>
                                                            <Badge variant="outline" className="text-[10px]">{activity.points} Points</Badge>
                                                        </div>
                                                        <p className="text-xs text-slate-500">{activity.provider}</p>
                                                        <p className="text-[10px] text-slate-400">{format(new Date(activity.activity_date), "MMM yyyy")}</p>
                                                    </div>
                                                ))
                                            )}
                                        </TabsContent>
                                    </div>
                                </ScrollArea>
                            </Tabs>
                        </div>

                        <div className="p-6 border-t bg-slate-50/50 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Management Actions</h3>
                            <div className="flex gap-2">
                                {data.status === 'pending' && (
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={handleAdmit}
                                        disabled={updating}
                                    >
                                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                        Admit Member
                                    </Button>
                                )}
                                {data.status === 'active' && (
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleStatusUpdate('suspended')}
                                        disabled={updating}
                                    >
                                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                        Suspend
                                    </Button>
                                )}
                                {data.status === 'suspended' && (
                                    <Button
                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                                        onClick={() => handleStatusUpdate('active')}
                                        disabled={updating}
                                    >
                                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                                        Restore Active
                                    </Button>
                                )}
                                <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
                            </div>
                            {/* Secondary actions — always visible */}
                            <div className="pt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-slate-600 hover:text-primary hover:border-primary gap-2"
                                    onClick={handleSendUpdateRequest}
                                    disabled={sendingUpdateRequest}
                                >
                                    {sendingUpdateRequest
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <Mail className="h-4 w-4" />}
                                    {sendingUpdateRequest ? "Sending..." : "Request Profile Update"}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    )
}


import { cn } from "@/lib/utils"
