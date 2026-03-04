"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, FileText, CreditCard, ArrowUpRight, ShieldCheck, Search, Activity, MoreHorizontal, Calendar } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ErrorBoundary } from "@/components/error-boundary"

interface AdminDashboardClientProps {
    initialData: {
        stats?: any[]
        pendingVerifications?: number
        recentActivity?: any[]
        error?: string
    }
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
    const [stats, setStats] = useState<any[]>([])
    const [pendingCount, setPendingCount] = useState(0)
    const [activities, setActivities] = useState<any[]>([])

    useEffect(() => {
        if (initialData.error) {
            toast.error(initialData.error)
        } else {
            if (initialData.stats) {
                const iconMap: any = {
                    "Total Students": GraduationCap,
                    "Certified Members": Users,
                    "Active Programs": FileText,
                    "Total Revenue": CreditCard
                }
                const colorMap: any = {
                    "Total Students": "text-blue-600",
                    "Certified Members": "text-amber-600",
                    "Active Programs": "text-emerald-600",
                    "Total Revenue": "text-purple-600"
                }
                const bgMap: any = {
                    "Total Students": "bg-blue-100",
                    "Certified Members": "bg-amber-100",
                    "Active Programs": "bg-emerald-100",
                    "Total Revenue": "bg-purple-100"
                }

                setStats(initialData.stats.map((s: any) => ({
                    ...s,
                    icon: iconMap[s.title] || Activity,
                    color: colorMap[s.title] || "text-slate-600",
                    bg: bgMap[s.title] || "bg-slate-100"
                })))
            }
            if (initialData.pendingVerifications !== undefined) {
                setPendingCount(initialData.pendingVerifications)
            }
            if (initialData.recentActivity) {
                setActivities(initialData.recentActivity)
            }
        }
    }, [initialData])

    // Get current date string
    const currentDateRange = format(new Date(), "MMM d, yyyy")

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">
                        Welcome back, Administrator. You have <span className="font-medium text-amber-600">{pendingCount} pending verifications</span> today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white">
                        <Calendar className="mr-2 h-4 w-4" />
                        {currentDateRange}
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <ErrorBoundary>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <stat.icon className={`h-24 w-24 ${stat.color}`} />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <p className="flex items-center text-xs font-medium text-slate-500">
                                    <Badge variant="success" className="mr-2 h-5 py-0 px-1.5 flex items-center">
                                        <ArrowUpRight className="mr-1 h-3 w-3" />
                                        Live
                                    </Badge>
                                    sync with database
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ErrorBoundary>

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-3">
                <ErrorBoundary className="col-span-1 lg:col-span-2 shadow-sm rounded-xl">
                    <Card className="col-span-full border-none shadow-none bg-transparent order-2 lg:order-1">
                        <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between py-4 rounded-t-xl">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800">Recent Activity</CardTitle>
                                <CardDescription className="hidden sm:block">Latest registrations and system events</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5" asChild>
                                <Link href="/admin/members">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 bg-white rounded-b-xl overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {activities.length > 0 ? (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                                            <Avatar className="h-10 w-10 border border-slate-100">
                                                <AvatarFallback className={`text-xs font-bold ${activity.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                                    {activity.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        {activity.type}
                                                    </p>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>No recent activity found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </ErrorBoundary>

                {/* Quick Actions & Notifications */}
                <ErrorBoundary className="shadow-sm rounded-xl">
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative">
                            <div className="absolute -right-10 -bottom-10 opacity-10">
                                <ShieldCheck className="w-40 h-40" />
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5" />
                                    Registry Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                                        <span className="text-white/80 text-sm">Pending Verifications</span>
                                        <span className="font-bold text-xl">{pendingCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/80 text-sm">Action Needed</span>
                                        <span className="font-bold text-xl">{pendingCount > 0 ? "YES" : "NO"}</span>
                                    </div>
                                    <Link href="/admin/members?status=paid" className="w-full bg-white text-primary hover:bg-white/90 font-bold mt-4 shadow-lg inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2">
                                        Go to Verifications
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <Link href="/admin/training" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                    <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">LMS Training</span>
                                </Link>
                                <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                    <div className="p-2 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
                                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">Verify ID</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                    <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">Reports</span>
                                </button>
                                <Link href="/admin/members" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                    <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                                        <Search className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">Find Member</span>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </ErrorBoundary>
            </div>
        </div>
    )
}
