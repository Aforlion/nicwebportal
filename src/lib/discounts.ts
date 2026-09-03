import { SupabaseClient } from "@supabase/supabase-js"

export interface DiscountInfo {
    isTrainingCenter: boolean
    discountPercent: number
    discountAmount: number
    originalPrice: number
    finalPrice: number
}

/**
 * Checks if a user is associated with an accredited Training Center / Institutional Partner
 * and calculates the 25% discount on course pricing.
 */
export async function checkTrainingCenterDiscount(
    supabase: SupabaseClient,
    userId: string,
    coursePrice: number
): Promise<DiscountInfo> {
    if (coursePrice <= 0) {
        return {
            isTrainingCenter: false,
            discountPercent: 0,
            discountAmount: 0,
            originalPrice: coursePrice,
            finalPrice: 0
        }
    }

    let isTC = false

    // 1. Check if user owns a training facility
    const { data: ownedFacility } = await supabase
        .from('facilities')
        .select('facility_type')
        .eq('owner_id', userId)
        .maybeSingle()

    if (ownedFacility && ['training_agency', 'training_institution'].includes(ownedFacility.facility_type)) {
        isTC = true
    }

    if (!isTC) {
        // 2. Check profile role and linked training_facility_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, training_facility_id')
            .eq('id', userId)
            .maybeSingle()

        if (profile?.role === 'facility_admin') {
            isTC = true
        } else if (profile?.training_facility_id) {
            const { data: linkedFac } = await supabase
                .from('facilities')
                .select('facility_type')
                .eq('id', profile.training_facility_id)
                .maybeSingle()
            if (linkedFac && ['training_agency', 'training_institution'].includes(linkedFac.facility_type)) {
                isTC = true
            }
        }
    }

    if (!isTC) {
        // 3. Check membership category
        const { data: membership } = await supabase
            .from('memberships')
            .select('category')
            .eq('user_id', userId)
            .maybeSingle()

        if (membership?.category === 'institutional') {
            isTC = true
        }
    }

    if (isTC) {
        const discountPercent = 25
        const discountAmount = Math.round(coursePrice * 0.25)
        const finalPrice = Math.max(0, coursePrice - discountAmount)
        return {
            isTrainingCenter: true,
            discountPercent,
            discountAmount,
            originalPrice: coursePrice,
            finalPrice
        }
    }

    return {
        isTrainingCenter: false,
        discountPercent: 0,
        discountAmount: 0,
        originalPrice: coursePrice,
        finalPrice: coursePrice
    }
}
