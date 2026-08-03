import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { env } from "@/env"

export async function GET(
    request: NextRequest,
    { params }: { params: { nicId: string } }
) {
    const { nicId } = params

    if (!nicId) {
        return NextResponse.json(
            { success: false, error: "Missing NIC Member ID" },
            { status: 400 }
        )
    }

    // Create the admin client to bypass RLS for public registry queries
    const supabase = createAdminClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        // 1. Fetch Membership and associated Profile details
        const { data: membership, error: memError } = await supabase
            .from("memberships")
            .select(`
                id,
                user_id,
                category,
                nic_id,
                expiry_date,
                is_active,
                status,
                joined_date,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .or(`nic_id.eq.${nicId},member_id.eq.${nicId}`)
            .maybeSingle()

        if (memError) {
            console.error("Database error retrieving membership:", memError)
            return NextResponse.json(
                { success: false, error: "Database error retrieving membership" },
                { status: 500 }
            )
        }

        if (!membership) {
            // Log failed verification attempt
            await logApiCall(supabase, request, nicId, "failed")
            return NextResponse.json(
                { success: false, error: "Member not found" },
                { status: 404 }
            )
        }

        const userId = membership.user_id
        const profile: any = membership.profiles

        // 2. Fetch completed courses
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from("enrollments")
            .select(`
                id,
                enrolled_at,
                courses (
                    title,
                    level
                )
            `)
            .eq("user_id", userId)
            .eq("status", "completed")

        if (enrollmentsError) {
            console.error("Error fetching completed courses:", enrollmentsError)
        }

        const certifications = (enrollments || []).map((enrollment: any) => ({
            title: enrollment.courses?.title || "Unknown Course",
            level: enrollment.courses?.level || "Unknown Level",
            completed_at: enrollment.enrolled_at
        }))

        // 3. Fetch internship status
        const { data: internship, error: internshipError } = await supabase
            .from("internships")
            .select(`
                id,
                status,
                agency_name
            `)
            .eq("user_id", userId)
            .eq("status", "approved")
            .maybeSingle()

        if (internshipError) {
            console.error("Error fetching internship details:", internshipError)
        }

        // 4. Log successful verification attempt
        await logApiCall(supabase, request, nicId, "verified")

        // 5. Build and return structured payload
        return NextResponse.json({
            success: true,
            data: {
                nic_id: membership.nic_id,
                full_name: profile?.full_name || "Unknown Member",
                avatar_url: profile?.avatar_url || null,
                status: membership.status,
                is_active: membership.is_active,
                category: membership.category,
                joined_date: membership.joined_date,
                expiry_date: membership.expiry_date,
                certifications,
                internship: internship ? {
                    status: internship.status,
                    agency_name: internship.agency_name || "Accredited Agency"
                } : null
            }
        })

    } catch (err: any) {
        console.error("Unexpected error in verify API route:", err)
        return NextResponse.json(
            { success: false, error: err.message || "An unexpected error occurred" },
            { status: 500 }
        )
    }
}

/**
 * Audit log helper that catches errors gracefully in case the logging table does not exist yet.
 */
async function logApiCall(supabase: any, request: NextRequest, nicId: string, status: string) {
    try {
        const callerIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null
        const userAgent = request.headers.get("user-agent") || null

        await supabase
            .from("nic_api_logs")
            .insert({
                caller_ip: callerIp,
                user_agent: userAgent,
                nic_id: nicId,
                status: status
            })
    } catch (logError) {
        // Fail silently so verification responses are never blocked by logging failures
        console.warn("Failed to write to nic_api_logs:", logError)
    }
}
