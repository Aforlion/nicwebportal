'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getAccreditedFacilities(search?: string, level?: number) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    let query = supabase
        .from('facilities')
        .select('id, name, registration_number, city, state, accreditation_level, grade, status')
        .eq('compliance_status', 'compliant')
        .not('accreditation_level', 'is', null)

    if (search) {
        query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,registration_number.ilike.%${search}%`)
    }

    if (level && level > 0) {
        query = query.eq('accreditation_level', level)
    }

    const { data, error } = await query.order('accreditation_level', { ascending: false })

    if (error) {
        console.error('Error fetching registry:', error)
        return []
    }

    return data
}
