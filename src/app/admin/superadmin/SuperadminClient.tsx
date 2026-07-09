"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldAlert, Users, Server, Database, Settings, Activity, Search, RefreshCw, AlertTriangle, Clock } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { 
    updateUserRoleAction, 
    getDatabaseStats, 
    getUsersList, 
    getAuditLogs, 
    updateSystemConfig,
    DbStatItem,
    UserProfile,
    AuditLogItem 
} from "@/actions/admin/superadmin-actions"

interface SuperadminClientProps {
    initialDbStats: DbStatItem[]
    initialUsers: UserProfile[]
    initialLogs: AuditLogItem[]
    initialConfig: {
        maintenanceMode: boolean
        signupLock: boolean
        mockMode: boolean
    }
}

export function SuperadminClient({ 
    initialDbStats, 
    initialUsers, 
    initialLogs,
    initialConfig 
}: SuperadminClientProps) {
    const [isPending, startTransition] = useTransition()
    const [dbStats, setDbStats] = useState(initialDbStats)
    const [users, setUsers] = useState(initialUsers)
    const [logs, setLogs] = useState(initialLogs)
    const [config, setConfig] = useState(initialConfig)
    
    // Search and Filter User state
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")

    // Reload stats helper
    const handleRefreshData = async () => {
        toast.promise(
            Promise.all([
                getDatabaseStats().then(res => res.success && setDbStats(res.dbStats || [])),
                getUsersList().then(res => res.success && setUsers(res.users || [])),
                getAuditLogs().then(res => res.success && setLogs(res.logs || []))
            ]),
            {
                loading: 'Refreshing system metrics...',
                success: 'Metrics updated successfully',
                error: 'Failed to refresh metrics'
            }
        )
    }

    // Toggle Config helpers
    const handleToggleConfig = async (key: string, currentValue: boolean) => {
        const newValue = !currentValue
        startTransition(async () => {
            const res = await updateSystemConfig(key, newValue)
            if (res.success) {
                setConfig(prev => ({ ...prev, [key === 'maintenance_mode' ? 'maintenanceMode' : 'signupLock']: newValue }))
                toast.success(`System parameter updated successfully`)
                // Refresh logs to capture audit
                const logsRes = await getAuditLogs()
                if (logsRes.success) setLogs(logsRes.logs || [])
            } else {
                toast.error(res.error || "Failed to update configuration")
            }
        })
    }

    // Update Role handler
    const handleRoleChange = async (userId: string, newRole: string) => {
        toast.promise(
            updateUserRoleAction(userId, newRole).then(async (res) => {
                if (!res.success) throw new Error(res.error)
                // Reload users and logs
                const [usersRes, logsRes] = await Promise.all([getUsersList(), getAuditLogs()])
                if (usersRes.success) setUsers(usersRes.users || [])
                if (logsRes.success) setLogs(logsRes.logs || [])
                return true
            }),
            {
                loading: 'Updating user privileges...',
                success: 'User role updated successfully',
                error: (err) => err.message || 'Failed to update user role'
            }
        )
    }

    // Filter users list
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header console */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6 border-slate-200 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="destructive" className="bg-red-500 hover:bg-red-500 font-extrabold text-white text-[10px] tracking-wider px-2 py-0.5 uppercase">
                            Superadmin Mode
                        </Badge>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-slate-400 font-semibold">Secure Session</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
                        Superadmin Console
                    </h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">
                        Monitor database statistics, manage system permissions, override configurations, and track administrative audit trails.
                    </p>
                </div>
                <Button onClick={handleRefreshData} variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <RefreshCw className="mr-2 h-4 w-4 text-slate-500 animate-spin-hover" />
                    Sync Systems
                </Button>
            </div>

            <Tabs defaultValue="health" className="w-full space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-lg bg-slate-100 p-1 rounded-xl dark:bg-slate-950">
                    <TabsTrigger value="health" className="rounded-lg font-bold flex items-center justify-center gap-2">
                        <Server className="h-4 w-4" />
                        System Health
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-lg font-bold flex items-center justify-center gap-2">
                        <Users className="h-4 w-4" />
                        User Permissions
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg font-bold flex items-center justify-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings & Logs
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: System Health */}
                <TabsContent value="health" className="space-y-6">
                    {/* Status grid */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database Engine</CardDescription>
                                <CardTitle className="text-xl font-bold flex items-center justify-between">
                                    Supabase Postgres
                                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/20">Operational</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Primary PostgreSQL schema housing member profiles, training records, facilities registries, and payment states.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Distributed Cache</CardDescription>
                                <CardTitle className="text-xl font-bold flex items-center justify-between">
                                    Upstash Redis
                                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/20">Operational</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Caches system configuration triggers, rate limit parameters, and temporary session keys to optimize latency.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Document Storage</CardDescription>
                                <CardTitle className="text-xl font-bold flex items-center justify-between">
                                    S3 Bucket
                                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/20">Operational</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Houses digital certificates, facility inspection reports, and member photo credentials with strict access controls.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Row Counts */}
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <Database className="h-5 w-5 text-indigo-500" />
                                Database Table Statistics
                            </CardTitle>
                            <CardDescription className="text-xs">Live count of primary data structures in PostgreSQL database</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-850">
                                {dbStats.map((stat) => (
                                    <div key={stat.table} className="flex justify-between items-center p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                        <div>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
                                                {stat.table.replace(/_/g, ' ')}
                                            </span>
                                            <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                                {stat.table}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                                {stat.count.toLocaleString()} rows
                                            </span>
                                            {stat.status === 'healthy' ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/20 border-none font-bold">
                                                    Healthy
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 border-none font-bold">
                                                    Sync Error
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: User Management */}
                <TabsContent value="users" className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-amber-500" />
                                User Permissions Directory
                            </CardTitle>
                            <CardDescription className="text-xs">Filter, search, and manage roles for all registered portal accounts</CardDescription>
                            
                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-4 mt-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by name or email address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-950 dark:border-slate-850"
                                    />
                                </div>
                                <select 
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="h-10 rounded-lg bg-slate-50 border border-slate-200 px-3 text-sm font-semibold text-slate-700 focus:bg-white dark:bg-slate-950 dark:border-slate-850 dark:text-slate-300"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="member">Members</option>
                                    <option value="inspector">Inspectors</option>
                                    <option value="admin">Admins</option>
                                    <option value="super_admin">Superadmins</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-850 dark:bg-slate-900/20">
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider">User Details</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider">Current Role</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Actions / Modify Permissions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-semibold text-slate-800 dark:text-white text-sm">{user.full_name}</div>
                                                        <div className="text-xs text-slate-400">{user.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge className={
                                                            user.role === 'super_admin' ? "bg-red-500/10 text-red-600 dark:text-red-400 font-bold border-none" :
                                                            user.role === 'admin' ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border-none" :
                                                            user.role === 'inspector' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border-none" :
                                                            user.role === 'member' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-none" :
                                                            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold border-none"
                                                        }>
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="inline-flex gap-2">
                                                            {/* Role modify select drop-down */}
                                                            <select 
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                                className="h-8 rounded border border-slate-200 px-2 text-xs font-bold bg-white text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                                                            >
                                                                <option value="student">Student</option>
                                                                <option value="member">Member</option>
                                                                <option value="inspector">Inspector</option>
                                                                <option value="admin">Admin</option>
                                                                <option value="super_admin">Super Admin</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-slate-400">
                                                    No users found matching query
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Settings & Logs */}
                <TabsContent value="settings" className="grid gap-6 lg:grid-cols-3">
                    {/* Settings Override Toggles */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-md font-bold flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-slate-500" />
                                    System Override Toggles
                                </CardTitle>
                                <CardDescription className="text-xs">Modify operational toggles globally across portal environments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Toggle 1 */}
                                <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-semibold text-slate-800 dark:text-white">Maintenance Mode</div>
                                        <p className="text-xs text-slate-400">Puts public portal offline for updates</p>
                                    </div>
                                    <Button 
                                        disabled={isPending}
                                        onClick={() => handleToggleConfig('maintenance_mode', config.maintenanceMode)}
                                        variant={config.maintenanceMode ? "destructive" : "outline"}
                                        size="sm"
                                        className="font-bold rounded-lg"
                                    >
                                        {config.maintenanceMode ? "Online" : "Offline"}
                                    </Button>
                                </div>

                                {/* Toggle 2 */}
                                <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-semibold text-slate-800 dark:text-white">Signup Gate Lock</div>
                                        <p className="text-xs text-slate-400">Disable new student signups temporarily</p>
                                    </div>
                                    <Button 
                                        disabled={isPending}
                                        onClick={() => handleToggleConfig('signup_lock', config.signupLock)}
                                        variant={config.signupLock ? "destructive" : "outline"}
                                        size="sm"
                                        className="font-bold rounded-lg"
                                    >
                                        {config.signupLock ? "Lock" : "Unlock"}
                                    </Button>
                                </div>

                                {/* Mock mode - Readonly */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-semibold text-slate-800 dark:text-white">API Mock State</div>
                                        <p className="text-xs text-slate-400">Database fallback simulation</p>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-none">
                                        Active
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Audit Logs list */}
                    <Card className="col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex flex-col">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between py-4">
                            <div>
                                <CardTitle className="text-md font-bold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-red-500" />
                                    Administrative Audit Trail
                                </CardTitle>
                                <CardDescription className="text-xs">Real-time log of security role changes and configuration adjustments</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow max-h-[400px] overflow-y-auto">
                            <div className="divide-y divide-slate-100 dark:divide-slate-850">
                                {logs.length > 0 ? (
                                    logs.map((log) => {
                                        const dateString = format(new Date(log.created_at), "MMM d, yyyy HH:mm")
                                        return (
                                            <div key={log.id} className="flex gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 h-9 w-9 flex items-center justify-center">
                                                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-wider py-0 px-1 text-slate-600 dark:text-slate-300">
                                                            {log.action}
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                                                            <Clock className="h-3 w-3" />
                                                            {dateString}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        Admin: <span className="font-bold text-slate-800 dark:text-white">{log.admin_email}</span> updated <span className="capitalize">{log.target_type}</span> ({log.target_id})
                                                    </p>
                                                    {log.details && Object.keys(log.details).length > 0 && (
                                                        <pre className="text-[10px] text-slate-500 mt-2 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-900 overflow-x-auto font-mono">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="p-8 text-center text-slate-400">
                                        <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs">No administrative actions logged yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
