"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    History,
    Search,
    Filter,
    ArrowLeft,
    Ban,
    ShieldOff,
    CheckCircle,
    User,
    Calendar,
    ArrowRight
} from "lucide-react"

type AuditLog = {
    id: string
    target_type: string
    target_id: string
    action_type: string
    reason: string
    performed_by: string
    performed_at: string
    admin_name?: string
    caregiver_name?: string
}

export default function AuditTrailPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchAuditLogs()
    }, [])

    const fetchAuditLogs = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('registry_actions')
                .select(`
                    id,
                    target_type,
                    target_id,
                    action_type,
                    reason,
                    performed_by,
                    performed_at,
                    profiles!registry_actions_performed_by_fkey(full_name)
                `)
                .order('performed_at', { ascending: false })

            if (error) throw error

            // Note: Currently we don't have a direct link to the target caregiver name in the table
            // In a real app we'd join with profiles again via the target_id
            setLogs(data.map((log: any) => ({
                ...log,
                admin_name: log.profiles?.full_name || 'System'
            })))
        } catch (error) {
            console.error("Error fetching audit logs:", error)
        } finally {
            setLoading(false)
        }
    }

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'suspend': return <Ban className="h-4 w-4 text-orange-600" />
            case 'revoke': return <ShieldOff className="h-4 w-4 text-red-600" />
            case 'reinstate': return <CheckCircle className="h-4 w-4 text-emerald-600" />
            default: return <History className="h-4 w-4 text-slate-500" />
        }
    }

    const getActionColor = (type: string) => {
        switch (type) {
            case 'suspend': return 'text-orange-700 bg-orange-50 border-orange-200'
            case 'revoke': return 'text-red-700 bg-red-50 border-red-200'
            case 'reinstate': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
            default: return 'text-slate-700 bg-slate-50 border-slate-200'
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin/registry/caregivers'}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Registry Audit Trail</h1>
                    <p className="text-muted-foreground">Traceability and accountability of all administrative actions</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Actions</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <History className="h-8 w-8 mx-auto mb-2 animate-spin text-slate-300" />
                                Loading logs...
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                No activity recorded yet.
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-slate-100 ml-4 pb-4">
                                {logs.map((log, index) => (
                                    <div key={log.id} className="mb-10 ml-6 last:mb-0">
                                        <span className={`absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white ${getActionColor(log.action_type)}`}>
                                            {getActionIcon(log.action_type)}
                                        </span>
                                        <div className="p-4 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`capitalize font-bold text-[10px] ${getActionColor(log.action_type)}`}>
                                                        {log.action_type}ed
                                                    </Badge>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        Caregiver Status Changed
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-[11px] text-slate-400 font-medium">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(log.performed_at).toLocaleString()}
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded italic border-l-4 border-slate-200 mb-4">
                                                "{log.reason}"
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <User className="h-3 w-3 mr-1" />
                                                    Performed by: <span className="font-bold text-slate-700 ml-1">{log.admin_name}</span>
                                                </div>
                                                <div className="flex items-center text-[10px] font-mono text-slate-400">
                                                    ID: {log.id.split('-')[0]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
