"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Building2,
    Search,
    MapPin,
    Calendar,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
    ArrowRight,
    Plus,
    FileCheck,
    Eye,
    Check,
    X,
    Clock,
    Award
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { AccreditationApplicationDialog } from "@/components/admin/accreditation-application-dialog"
import { updateAccreditationApplicationStatus } from "@/actions/admin/manage-accreditation-applications"

interface Facility {
    id: string
    dbId: string
    name: string
    location: string
    status: string
    lastInspection: string
    staffCount: number
}

interface InspectionsClientProps {
    initialFacilities: Facility[]
    stats: {
        total: number
        compliant: number
        pending: number
        critical: number
    }
    initialApplications?: any[]
}

export default function InspectionsClient({ initialFacilities, stats, initialApplications = [] }: InspectionsClientProps) {
    const [facilities] = useState(initialFacilities)
    const [applications, setApplications] = useState(initialApplications)
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState("facilities")
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null)
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

    const pendingApplicationsCount = applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length

    const filteredFacilities = facilities.filter(fac =>
        fac.name.toLowerCase().includes(search.toLowerCase()) ||
        fac.location.toLowerCase().includes(search.toLowerCase()) ||
        fac.id.toLowerCase().includes(search.toLowerCase())
    )

    const filteredApplications = applications.filter(app => {
        const facName = app.facility?.name || ""
        const facReg = app.facility?.registration_number || ""
        const city = app.facility?.city || ""
        const state = app.facility?.state || ""
        const q = search.toLowerCase()
        return facName.toLowerCase().includes(q) ||
            facReg.toLowerCase().includes(q) ||
            city.toLowerCase().includes(q) ||
            state.toLowerCase().includes(q)
    })

    const handleAccreditationAction = async (appId: string, status: 'under_review' | 'approved' | 'rejected') => {
        setActionLoadingId(appId)
        try {
            const res = await updateAccreditationApplicationStatus(appId, status)
            if (res.success) {
                toast.success(`Application status updated to ${status.replace('_', ' ')}`)
                setApplications(prev =>
                    prev.map(a => a.id === appId ? { ...a, status } : a)
                )
                setSelectedApplication(null)
            } else {
                toast.error(res.error || "Failed to update application")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setActionLoadingId(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-secondary">Facility Regulation & Accreditation</h1>
                    <p className="text-muted-foreground">Manage institutional compliance, 6-pillar accreditation reviews, and licensing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="text-primary border-primary/30 hover:bg-primary/5" asChild>
                        <a href="/admin/action-center">
                            <Clock className="mr-2 h-4 w-4 text-amber-600" />
                            Open Action Center
                        </a>
                    </Button>
                    <Button className="bg-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Register New Facility
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Facilities</p>
                        <div className="text-2xl font-bold text-secondary mt-1">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Compliant</p>
                        <div className="text-2xl font-bold text-secondary mt-1">{stats.compliant}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pending Regulation</p>
                        <div className="text-2xl font-bold text-secondary mt-1">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Accreditation Submissions</p>
                        <div className="text-2xl font-bold text-indigo-900 mt-1 flex items-center gap-2">
                            {applications.length}
                            {pendingApplicationsCount > 0 && (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    {pendingApplicationsCount} Pending
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="facilities" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Facility Registry ({facilities.length})
                        </TabsTrigger>
                        <TabsTrigger value="applications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-primary" />
                            Accreditation Applications ({applications.length})
                            {pendingApplicationsCount > 0 && (
                                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 h-4">
                                    {pendingApplicationsCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={activeTab === "facilities" ? "Search facilities..." : "Search applications..."}
                            className="pl-9 h-10 text-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tab 1: Facilities Registry */}
                <TabsContent value="facilities" className="space-y-6 m-0">
                    <div className="grid gap-6 md:grid-cols-2">
                        {filteredFacilities.length === 0 ? (
                            <div className="md:col-span-2 py-12 text-center text-muted-foreground">
                                No facilities found matching your search.
                            </div>
                        ) : (
                            filteredFacilities.map((fac) => (
                                <Card key={fac.dbId} className="group hover:shadow-md transition-all">
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
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{fac.location || 'Unknown Location'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4 shrink-0" />
                                                <span>Last: {fac.lastInspection}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <span className="text-xs font-bold text-muted-foreground">{fac.staffCount} Capacity</span>
                                            <Button variant="ghost" size="sm" className="h-8 hover:text-primary" asChild>
                                                <a href={`/admin/inspections/${fac.dbId}`}>
                                                    Manage <ArrowRight className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Tab 2: Accreditation Applications */}
                <TabsContent value="applications" className="space-y-6 m-0">
                    <div className="grid gap-4">
                        {filteredApplications.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground border rounded-xl bg-white">
                                <Award className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold">No accreditation applications found.</p>
                                <p className="text-xs">Applications submitted via the 6-pillar facility audit form will appear here.</p>
                            </div>
                        ) : (
                            filteredApplications.map((app) => (
                                <Card key={app.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow bg-white">
                                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-base text-slate-900">{app.facility?.name || "Care Institution"}</span>
                                                <Badge variant="outline" className="font-mono text-xs">{app.facility?.registration_number || 'N/A'}</Badge>
                                                <Badge className={
                                                    app.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-none' :
                                                    app.status === 'under_review' ? 'bg-blue-100 text-blue-800 border-none' :
                                                    app.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-none' :
                                                    'bg-amber-100 text-amber-800 border-none'
                                                }>
                                                    {app.status?.replace('_', ' ').toUpperCase() || 'SUBMITTED'}
                                                </Badge>
                                            </div>

                                            <p className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                                                <span>Type: <strong className="capitalize">{app.facility?.facility_type?.replace('_', ' ') || 'Facility'}</strong></span>
                                                <span>Location: <strong>{app.facility?.city || ''}{app.facility?.city && app.facility?.state ? ', ' : ''}{app.facility?.state || 'N/A'}</strong></span>
                                                <span>Submitted: <strong>{app.created_at ? format(new Date(app.created_at), 'PPP') : 'Recently'}</strong></span>
                                            </p>

                                            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                                                <span>Legal Status: <strong className="text-slate-800">{app.application_data?.legal_status || 'N/A'}</strong></span>
                                                <span>•</span>
                                                <span>Ratio: <strong className="text-slate-800">{app.application_data?.staff_ratio || 'N/A'}</strong></span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-primary text-primary hover:bg-primary/5 font-semibold text-xs h-9"
                                                onClick={() => setSelectedApplication(app)}
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-1" /> Inspect 6 Pillars
                                            </Button>

                                            {app.status !== 'under_review' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={actionLoadingId === app.id}
                                                    className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs h-9"
                                                    onClick={() => handleAccreditationAction(app.id, 'under_review')}
                                                >
                                                    <Clock className="h-3.5 w-3.5 mr-1" /> Mark Review
                                                </Button>
                                            )}

                                            {app.status !== 'approved' && (
                                                <Button
                                                    size="sm"
                                                    disabled={actionLoadingId === app.id}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9"
                                                    onClick={() => handleAccreditationAction(app.id, 'approved')}
                                                >
                                                    <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                                </Button>
                                            )}

                                            {app.status !== 'rejected' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={actionLoadingId === app.id}
                                                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-9"
                                                    onClick={() => handleAccreditationAction(app.id, 'rejected')}
                                                >
                                                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Reusable 6-Pillar Application Modal */}
            <AccreditationApplicationDialog
                application={selectedApplication}
                open={!!selectedApplication}
                onOpenChange={(open) => !open && setSelectedApplication(null)}
                onAction={handleAccreditationAction}
                isLoading={actionLoadingId === selectedApplication?.id}
            />
        </div>
    )
}
