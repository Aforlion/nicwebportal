'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getFacilityInspectionDetails(facilityId: string) {
    await requireAdmin()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: facility, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single()

    if (error) return { error: error.message }

    const { data: previousScores } = await supabase
        .from('inspection_scores')
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false })

    return { facility, previousScores: previousScores || [] }
}

export async function submitInspectionAction(
    facilityId: string, 
    inspectorId: string,
    scores: { pillar_name: string, score: number, comments: string }[]
) {
    await requireAdmin()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    try {
        // 1. Insert interaction scores
        const { error: scoreError } = await supabase
            .from('inspection_scores')
            .insert(scores.map(s => ({
                facility_id: facilityId,
                inspector_id: inspectorId,
                pillar_name: s.pillar_name,
                score: s.score,
                comments: s.comments
            })))

        if (scoreError) throw scoreError

        // 2. Calculate Overall Grade (A, B, C)
        const avgScore = scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length
        
        // Determination logic (simplified version of the SQL function)
        let grade = 'C'
        let accreditationLevel = 0
        
        if (avgScore >= 90) { grade = 'A'; accreditationLevel = 3; }
        else if (avgScore >= 75) { grade = 'B'; accreditationLevel = 2; }
        else if (avgScore >= 60) { grade = 'C'; accreditationLevel = 1; }
        
        // 3. Update Facility
        const { error: facError } = await supabase
            .from('facilities')
            .update({
                grade: grade,
                accreditation_level: accreditationLevel,
                compliance_status: avgScore >= 60 ? 'compliant' : 'sanctioned',
                last_inspection_date: new Date().toISOString(),
                license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString() // 2 years validity
            })
            .eq('id', facilityId)

        if (facError) throw facError

        revalidatePath(`/admin/inspections/${facilityId}`)
        revalidatePath('/admin/inspections')
        
        return { success: true, grade, accreditationLevel }
    } catch (err: any) {
        return { error: err.message }
    }
}
