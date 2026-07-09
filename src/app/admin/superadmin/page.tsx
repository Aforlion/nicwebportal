import { requireRole } from "@/lib/auth"
import { getDatabaseStats, getUsersList, getAuditLogs, getSystemConfig } from "@/actions/admin/superadmin-actions"
import { SuperadminClient } from "@/app/admin/superadmin/SuperadminClient"

export const dynamic = 'force-dynamic'

export default async function SuperadminConsolePage() {
    // Protect access to superadmins only
    await requireRole(['super_admin'])

    const [dbResult, usersResult, logsResult, configResult] = await Promise.all([
        getDatabaseStats(),
        getUsersList(),
        getAuditLogs(),
        getSystemConfig()
    ])

    const dbStats = dbResult.success ? dbResult.dbStats : []
    const users = usersResult.success ? usersResult.users : []
    const logs = logsResult.success ? logsResult.logs : []

    return (
        <SuperadminClient 
            initialDbStats={dbStats}
            initialUsers={users}
            initialLogs={logs}
            initialConfig={configResult}
        />
    )
}
