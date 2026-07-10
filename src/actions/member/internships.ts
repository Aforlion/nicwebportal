'use server'

import { createClient as createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { evaluateNCNAEligibilityAction } from "../../lib/actions/certification-engine"

export async function getStudentInternships() {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: "Unauthorized" }
        }

        const { data: internships, error } = await supabase
            .from('internships')
            .select('*, facilities(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, internships: internships || [] }
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch internships" }
    }
}

export async function saveInternshipRecord(data: {
    startDate: string
    endDate: string
    certificateUrl: string
    facilityId?: string | null
    customFacilityName?: string | null
}) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: "Unauthorized" }
        }

        const { error } = await supabase
            .from('internships')
            .insert({
                user_id: user.id,
                start_date: data.startDate,
                end_date: data.endDate,
                certificate_url: data.certificateUrl,
                facility_id: data.facilityId || null,
                custom_facility_name: data.customFacilityName || null,
                status: 'pending'
            })

        if (error) throw error

        revalidatePath('/portal/student/internship')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to save internship record" }
    }
}

// Admin Action to audit internship
export async function auditInternshipAction(internshipId: string, status: 'approved' | 'rejected', reason?: string) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(cookieStore)

        // Verify the user is admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'super_admin', 'registry_officer'].includes(profile.role)) {
            return { success: false, error: "Forbidden" }
        }

        // Update the internship
        const { data: internship, error: updateError } = await supabase
            .from('internships')
            .update({
                status,
                reviewed_by: user.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', internshipId)
            .select()
            .single()

        if (updateError) throw updateError

        // If approved, trigger the NCNA eligibility evaluation
        if (status === 'approved' && internship) {
            await evaluateNCNAEligibilityAction(internship.user_id)
        }

        revalidatePath('/admin/registry/caregivers')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to update status" }
    }
}
