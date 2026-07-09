'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { requireRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Redis } from '@upstash/redis'

export interface DbStatItem {
    table: string
    count: number
    status: string
    error?: string
}

export type DbStatsResponse = 
    | { success: true; dbStats: DbStatItem[] }
    | { success: false; error: string }

export interface UserProfile {
    id: string
    full_name: string
    email: string
    phone?: string | null
    role: string
    avatar_url?: string | null
    bio?: string | null
    created_at?: string | null
    updated_at?: string | null
}

export type UsersListResponse =
    | { success: true; users: UserProfile[] }
    | { success: false; error: string }

export interface AuditLogItem {
    id: string
    admin_id: string | null
    admin_email: string
    action: string
    target_type: string
    target_id: string | null
    details?: Record<string, unknown> | null
    ip_address?: string | null
    created_at: string
}

export type AuditLogsResponse =
    | { success: true; logs: AuditLogItem[]; warning?: string }
    | { success: false; error: string }

// Safe helper to run check on current user's role
async function checkSuperAdmin() {
    const profile = await requireRole(['super_admin'])
    return profile
}

// Log audit action helper
export async function logAdminAction(
    action: string,
    targetType: string,
    targetId: string | null,
    details: Record<string, unknown> = {}
): Promise<void> {
    try {
        const profile = await checkSuperAdmin()
        const clientIp = "127.0.0.1" // Fallback since standard server action headers are restricted

        const { error } = await supabaseAdmin
            .from('admin_audit_logs')
            .insert({
                admin_id: profile.id,
                admin_email: profile.email,
                action,
                target_type: targetType,
                target_id: targetId,
                details,
                ip_address: clientIp
            })
        
        if (error) {
            console.warn('[Audit Log Insert Warning - might need table migration]:', error.message)
        }
    } catch (err) {
        console.error('[logAdminAction Error]:', err)
    }
}

// 1. Fetch DB Stats (table row counts)
export async function getDatabaseStats(): Promise<DbStatsResponse> {
    await checkSuperAdmin()
    try {
        const tables = [
            'profiles',
            'memberships',
            'programs',
            'enrollments',
            'facilities',
            'inspections',
            'payments',
            'cpd_records',
            'admin_audit_logs'
        ]

        const statsPromises = tables.map(async (table) => {
            const { count, error } = await supabaseAdmin
                .from(table)
                .select('*', { count: 'exact', head: true })
            
            if (error) {
                return { table, count: 0, status: 'error', error: error.message }
            }
            return { table, count: count || 0, status: 'healthy' }
        })

        const dbStats = await Promise.all(statsPromises)
        return { success: true, dbStats }
    } catch (err: any) {
        return { success: false, error: err.message || 'Unauthorized' }
    }
}

// 2. Fetch User List
export async function getUsersList(): Promise<UsersListResponse> {
    await checkSuperAdmin()
    try {
        const { data: users, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, users: users || [] }
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to fetch users' }
    }
}

// 3. Update User Role
export async function updateUserRoleAction(targetProfileId: string, newRole: string) {
    const admin = await checkSuperAdmin()
    try {
        if (targetProfileId === admin.id) {
            return { success: false, error: "You cannot change your own super_admin role" }
        }

        // Fetch original profile for audit log
        const { data: originalProfile } = await supabaseAdmin
            .from('profiles')
            .select('role, email')
            .eq('id', targetProfileId)
            .single()

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetProfileId)

        if (error) throw error

        // Audit Log
        await logAdminAction(
            'UPDATE_USER_ROLE',
            'profile',
            targetProfileId,
            {
                email: originalProfile?.email || '',
                old_role: originalProfile?.role || '',
                new_role: newRole
            }
        )

        revalidatePath('/admin/superadmin')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update user role' }
    }
}

// 4. Fetch Audit Logs
export async function getAuditLogs(): Promise<AuditLogsResponse> {
    await checkSuperAdmin()
    try {
        const { data: logs, error } = await supabaseAdmin
            .from('admin_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            // Fallback gracefully if table not created
            console.warn('[getAuditLogs] Table admin_audit_logs may not exist:', error.message)
            return { success: true, logs: [], warning: "Migration table not created yet" }
        }
        
        // Map to ensure details matches Record<string, unknown>
        const safeLogs = (logs || []).map((l: any) => ({
            ...l,
            details: typeof l.details === 'object' && l.details !== null ? l.details : {}
        }))

        return { success: true, logs: safeLogs }
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to fetch audit logs' }
    }
}

// Redis Config Manager Toggles
function buildRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return null
    try { return new Redis({ url, token }) } catch { return null }
}

const redis = buildRedis()

export async function getSystemConfig() {
    await checkSuperAdmin()
    try {
        if (redis) {
            const maintenance = await redis.get('config:maintenance_mode')
            const signupLock = await redis.get('config:signup_lock')
            const mockMode = await redis.get('config:mock_mode')

            return {
                maintenanceMode: maintenance === 'true' || maintenance === true,
                signupLock: signupLock === 'true' || signupLock === true,
                mockMode: mockMode === 'true' || mockMode === true || true, // default to true if mock active
            }
        }
    } catch (e) {
        console.error("Redis config error:", e)
    }

    // Static Fallback
    return {
        maintenanceMode: false,
        signupLock: false,
        mockMode: true,
    }
}

export async function updateSystemConfig(configKey: string, value: boolean) {
    await checkSuperAdmin()
    try {
        if (redis) {
            await redis.set(`config:${configKey}`, value ? 'true' : 'false')
            await logAdminAction(
                'UPDATE_SYSTEM_CONFIG',
                'system',
                configKey,
                { value: value ? 1 : 0 }
            )
            return { success: true }
        }
        return { success: false, error: "Redis not configured for state changes" }
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update configuration' }
    }
}
