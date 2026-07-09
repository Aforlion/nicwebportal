"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, FileText, CreditCard, ArrowUpRight, ArrowDownRight, ShieldCheck, Search, Activity, MoreHorizontal, Calendar, TrendingUp } from "lucide-react"
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
        monthlyRevenue?: { month: string; amount: number }[]
        error?: string
    }
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
    const [stats, setStats] = useState<any[]>([])
    const [pendingCount, setPendingCount] = useState(0)
    const [activities, setActivities] = useState<any[]>([])
    const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; amount: number }[]>([])

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
                    "Total Students": "text-sky-500",
                    "Certified Members": "text-amber-500",
                    "Active Programs": "text-emerald-500",
                    "Total Revenue": "text-violet-500"
                }
                const bgMap: any = {
                    "Total Students": "bg-sky-50 dark:bg-sky-950/30",
                    "Certified Members": "bg-amber-50 dark:bg-amber-950/30",
                    "Active Programs": "bg-emerald-50 dark:bg-emerald-950/30",
                    "Total Revenue": "bg-violet-50 dark:bg-violet-950/30"
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
            if (initialData.monthlyRevenue) {
                setMonthlyRevenue(initialData.monthlyRevenue)
            }
        }
    }, [initialData])

    const currentDateRange = format(new Date(), "MMM d, yyyy")

    // Find the max revenue amount for SVG scaling
    const maxRevenue = monthlyRevenue.length > 0 
        ? Math.max(...monthlyRevenue.map(d => d.amount), 1000) 
        : 1000

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300 font-serif">
                        Dashboard Overview
                    </h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">
                        Welcome back, Administrator. Currently <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingCount} registrations</span> require verification.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                        {currentDateRange}
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-md dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-white">
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <ErrorBoundary>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const isUp = stat.trend === 'up'
                        const isDown = stat.trend === 'down'
                        return (
                            <Card key={stat.title} className="border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                                    <stat.icon className={`h-24 w-24 ${stat.color}`} />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-xl ${stat.bg} transition-transform group-hover:scale-110 duration-300`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent className="z-10 relative">
                                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                                        {stat.value}
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        {stat.change && (stat.trend !== 'neutral') ? (
                                            <Badge variant={isUp ? "success" : "destructive"} className="mr-2 py-0.5 px-2 flex items-center gap-1 font-bold">
                                                {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                {stat.change}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="mr-2 py-0.5 px-2 font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {stat.change || 'Live'}
                                            </Badge>
                                        )}
                                        <span className="text-slate-400 font-normal">vs previous month</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </ErrorBoundary>

            {/* Custom SVG Line Chart & Breakdown */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Revenue Performance</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Monthly revenue trends for the last 6 months</CardDescription>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Upward Trend
                            </div>
                        </div>

                        {/* Interactive Premium SVG Chart */}
                        <div className="h-64 w-full relative mt-6 pr-4">
                            {monthlyRevenue.length > 0 ? (
                                <div className="w-full h-full flex flex-col justify-between">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10 py-1">
                                        {[0, 1, 2, 3].map((n) => (
                                            <div key={n} className="w-full border-t border-slate-300 dark:border-slate-700" />
                                        ))}
                                    </div>

                                    {/* SVG path container */}
                                    <svg className="w-full h-48 overflow-visible z-10" viewBox="0 0 600 200" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3"/>
                                                <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.0"/>
                                            </linearGradient>
                                        </defs>

                                        {/* Filled Area */}
                                        <path
                                            d={`
                                                M 0 200
                                                ${monthlyRevenue.map((d, i) => {
                                                    const x = (i / (monthlyRevenue.length - 1)) * 600
                                                    const y = 200 - (d.amount / maxRevenue) * 160 - 20
                                                    return `L ${x} ${y}`
                                                }).join(' ')}
                                                L 600 200 Z
                                            `}
                                            fill="url(#chartGradient)"
                                        />

                                        {/* Line Path */}
                                        <path
                                            d={monthlyRevenue.map((d, i) => {
                                                const x = (i / (monthlyRevenue.length - 1)) * 600
                                                const y = 200 - (d.amount / maxRevenue) * 160 - 20
                                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                                            }).join(' ')}
                                            fill="none"
                                            stroke="rgb(139, 92, 246)"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* Dot Markers */}
                                        {monthlyRevenue.map((d, i) => {
                                            const x = (i / (monthlyRevenue.length - 1)) * 600
                                            const y = 200 - (d.amount / maxRevenue) * 160 - 20
                                            return (
                                                <g key={i} className="group/dot cursor-pointer">
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r="6"
                                                        fill="rgb(139, 92, 246)"
                                                        stroke="white"
                                                        strokeWidth="2.5"
                                                        className="transition-all duration-200 hover:r-8"
                                                    />
                                                    <circle cx={x} cy={y} r="14" fill="rgb(139, 92, 246)" fillOpacity="0" className="hover:fill-opacity-10" />
                                                </g>
                                            )
                                        })}
                                    </svg>

                                    {/* X-axis labels */}
                                    <div className="flex justify-between px-1 text-xs font-semibold text-slate-400 mt-2">
                                        {monthlyRevenue.map((d, i) => (
                                            <span key={i}>{d.month}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    No transaction data available
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Registry quick status and Action card */}
                <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white overflow-hidden relative p-6 flex flex-col justify-between dark:from-slate-950 dark:to-slate-900">
                    <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none">
                        <ShieldCheck className="w-56 h-56 text-white" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">System Health</span>
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold font-serif leading-tight">Registry Verification Panel</h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            Confirm payments and issue digital membership credentials to registered facilities and professional members.
                        </p>
                    </div>

                    <div className="my-6 space-y-4 border-t border-slate-800 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-xs">Awaiting Validation</span>
                            <span className="font-extrabold text-lg text-amber-400">{pendingCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-xs">Registry Status</span>
                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all" asChild>
                        <Link href="/admin/members?status=paid">
                            Go to Verifications
                        </Link>
                    </Button>
                </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between py-4">
                        <div>
                            <CardTitle className="text-md font-bold text-slate-800 dark:text-white">Recent Activity</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Latest user registrations and payment actions</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/5" asChild>
                            <Link href="/admin/members">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <div className="divide-y divide-slate-100 dark:divide-slate-850">
                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-800">
                                            <AvatarFallback className={`text-xs font-bold ${activity.status === 'paid' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"}`}>
                                                {activity.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                    {activity.type}
                                                </p>
                                                <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Activity className="h-3.5 w-3.5 opacity-60" />
                                                {activity.description}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-450 dark:text-slate-500">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-20 animate-pulse" />
                                    <p className="text-xs">No recent activity logged</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Grid */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl p-6">
                        <CardHeader className="p-0 pb-4">
                            <CardTitle className="text-md font-bold text-slate-800 dark:text-white">Quick Shortcuts</CardTitle>
                        </CardHeader>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admin/training" className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-violet-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-900 group">
                                <div className="p-2.5 rounded-full bg-violet-50 dark:bg-violet-950/40 group-hover:bg-violet-100 transition-colors">
                                    <GraduationCap className="h-5 w-5 text-violet-500" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">LMS Courses</span>
                            </Link>
                            
                            <Link href="/admin/cpd-review" className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-amber-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-amber-900 group">
                                <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 group-hover:bg-amber-100 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">CPD Reviews</span>
                            </Link>

                            <Link href="/admin/reports" className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-900 group">
                                <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-100 transition-colors">
                                    <FileText className="h-5 w-5 text-emerald-500" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Analytics Reports</span>
                            </Link>

                            <Link href="/admin/members" className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-sky-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-sky-900 group">
                                <div className="p-2.5 rounded-full bg-sky-50 dark:bg-sky-950/40 group-hover:bg-sky-100 transition-colors">
                                    <Search className="h-5 w-5 text-sky-500" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Find Records</span>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
