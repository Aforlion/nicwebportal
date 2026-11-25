"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Bell,
    FileText,
    Building2,
    Users,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    RefreshCw,
    ExternalLink
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAdminNotificationsAction, AdminActivityItem, AdminNotificationsSummary } from "@/actions/admin/get-notifications"
import { formatDistanceToNow } from "date-fns"

export function AdminNotificationsDropdown() {
    const [summary, setSummary] = useState<AdminNotificationsSummary | null>(null)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<'all' | 'pending'>('all')

    useEffect(() => {
        loadNotifications()
    }, [])

    async function loadNotifications() {
        setLoading(true)
        try {
            const res = await getAdminNotificationsAction()
            if (res.data) {
                setSummary(res.data)
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err)
        } finally {
            setLoading(false)
        }
    }

    const totalPending = summary?.totalPending || 0
    const activities = summary?.activities || []
    const filteredActivities = filter === 'pending'
        ? activities.filter(a => a.status === 'pending')
        : activities

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'document':
                return <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
            case 'facility':
                return <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
            case 'member':
                return <Users className="h-4 w-4 text-sky-500 shrink-0" />
            case 'internship':
                return <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
            default:
                return <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
        }
    }

    const formatTime = (isoString?: string) => {
        if (!isoString) return 'recently'
        try {
            return formatDistanceToNow(new Date(isoString), { addSuffix: true })
        } catch {
            return 'recently'
        }
    }

    return (
        <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary transition-colors">
                    <Bell className="h-5 w-5" />
                    {totalPending > 0 && (
                        <>
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                            <span className="sr-only">{totalPending} notifications</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[360px] sm:w-[420px] p-0 shadow-2xl border-slate-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 font-serif">Recent Activities</h4>
                            {totalPending > 0 ? (
                                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 text-[10px] font-bold border-none px-2">
                                    {totalPending} Action{totalPending > 1 ? 's' : ''} Needed
                                </Badge>
                            ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold border-none px-2">
                                    Up to date
                                </Badge>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Real-time submissions & registry changes</p>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                        onClick={(e) => {
                            e.preventDefault()
                            loadNotifications()
                        }}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center border-b border-slate-100 px-3 bg-white text-xs">
                    <button
                        onClick={() => setFilter('all')}
                        className={`py-2 px-3 font-semibold border-b-2 transition-colors ${filter === 'all'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        All Activity ({activities.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`py-2 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${filter === 'pending'
                            ? 'border-rose-500 text-rose-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Pending Actions
                        {totalPending > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                {totalPending}
                            </span>
                        )}
                    </button>
                </div>

                {/* Activity Feed */}
                <ScrollArea className="h-[360px]">
                    {loading && activities.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400">
                            <Clock className="h-6 w-6 mx-auto mb-2 opacity-30 animate-spin" />
                            Fetching latest activities...
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400">
                            <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-emerald-500 opacity-60" />
                            <p className="font-semibold text-slate-700">No pending actions</p>
                            <p className="text-[11px] text-slate-400 mt-1">All recent documents & submissions are reviewed.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredActivities.map((act) => (
                                <Link
                                    key={act.id}
                                    href={act.link}
                                    className="p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors block text-left group"
                                >
                                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100 group-hover:bg-white group-hover:shadow-xs transition-colors shrink-0">
                                        {getCategoryIcon(act.category)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                                                {act.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 shrink-0 font-medium whitespace-nowrap">
                                                {formatTime(act.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {act.description}
                                        </p>
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            {act.badgeText && (
                                                <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-medium ${
                                                    act.status === 'pending'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {act.badgeText}
                                                </Badge>
                                            )}
                                            <span className="text-[10px] text-primary group-hover:underline inline-flex items-center gap-0.5 font-medium ml-auto">
                                                Review <ExternalLink className="h-2.5 w-2.5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                        href="/admin/action-center"
                        className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1.5 transition-colors"
                    >
                        Go to Action Center <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

