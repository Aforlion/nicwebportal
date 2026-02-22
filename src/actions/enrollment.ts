'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function verifyPaymentAndEnroll(reference: string, courseId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated" }
    }

    // 1. Verify payment with Paystack API
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
        console.error("Paystack Secret Key is missing")
        return { error: "Payment configuration error" }
    }

    try {
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paystackSecret}`
            }
        })

        if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text()
            console.error("Paystack API error:", errorText)
            return { error: `Payment verification failed (HTTP ${verifyResponse.status})` }
        }

        const verifyData = await verifyResponse.json()

        if (!verifyData.status || verifyData.data.status !== 'success') {
            console.error("Payment not successful:", verifyData)
            return { error: verifyData.message || "Payment verification failed" }
        }

        // 2. Check if already enrolled
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single()

        if (existing) {
            console.log("User already enrolled in this course")
            return { success: true, enrollmentId: existing.id }
        }

        // 3. Create Enrollment Record
        const { data: enrollment, error: enrollError } = await supabase
            .from('enrollments')
            .insert({
                user_id: user.id,
                course_id: courseId,
                payment_reference: reference,
                progress: 0,
                completed_lessons: [],
                enrolled_at: new Date().toISOString()
            })
            .select()
            .single()

        if (enrollError) {
            console.error("Enrollment insert error:", enrollError)
            // Informative error for known schema mismatch
            if (enrollError.code === '42703') {
                return { error: "System error: Enrollment schema mismatch. Please run migrations." }
            }
            return { error: "Failed to create enrollment record. Please contact support." }
        }

        revalidatePath('/portal/student')
        return { success: true, enrollmentId: enrollment.id }

    } catch (err: any) {
        console.error("Payment verification internal error:", err)
        return { error: err.message || "Internal server error during payment verification" }
    }
}

export async function enrollFreeCourse(courseId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated" }
    }

    // Verify course is actually free
    const { data: course } = await supabase
        .from('courses')
        .select('price')
        .eq('id', courseId)
        .single()

    if (!course || course.price > 0) {
        return { error: "This course is not free" }
    }

    // Check if already enrolled
    const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (existing) {
        return { success: true, enrollmentId: existing.id }
    }

    // Create Enrollment
    const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
            user_id: user.id,
            course_id: courseId,
            progress: 0,
            completed_lessons: [],
            enrolled_at: new Date().toISOString()
        })
        .select()
        .single()

    if (enrollError) {
        console.error("Enrollment insert error:", enrollError)
        // Informative error for known schema mismatch
        if (enrollError.code === '42703') {
            return { error: "System error: Enrollment schema mismatch. Please run migrations." }
        }
        return { error: "Failed to create enrollment record. Please contact support." }
    }

    revalidatePath('/portal/student')
    return { success: true, enrollmentId: enrollment.id }
}
