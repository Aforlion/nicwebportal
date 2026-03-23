'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getStudentLevel } from "./get-student-progress"
import { isEligibleForCourse } from "@/lib/level-utils"
import { redirect } from "next/navigation"
import { sendEnrollmentEmail } from "@/lib/email"

export async function verifyPaymentAndEnroll(reference: string, courseId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "User not authenticated" }
    }

    // 1. Verify payment with Paystack API
    const paystackSecret = process.env.PAYSTACK_LIVE_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY
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

        // Check Eligibility
        const { data: course } = await supabase
            .from('courses')
            .select('level')
            .eq('id', courseId)
            .single()

        const { data: member } = await supabase
            .from('memberships')
            .select('category')
            .eq('user_id', user.id)
            .single()

        const academicLevel = await getStudentLevel(supabase, user.id)
        const eligibility = isEligibleForCourse({
            membershipCategory: member?.category || 'student',
            academicLevel,
            courseLevel: course?.level || 'Foundation'
        })

        if (!eligibility.eligible) {
            return {
                error: `Prerequisite Required: You must complete ${eligibility.requiredLevel} or upgrade your membership to enroll in this course.`
            }
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

        // 4. Send Confirmation Email
        const { data: courseData } = await supabase
            .from('courses')
            .select('title')
            .eq('id', courseId)
            .single()

        if (courseData) {
            await sendEnrollmentEmail(user.email!, user.user_metadata?.full_name || "Student", courseData.title, courseId)
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

    // Verify course is actually free and check level
    const { data: course } = await supabase
        .from('courses')
        .select('price, level')
        .eq('id', courseId)
        .single()

    if (!course || course.price > 0) {
        return { error: "This course is not free" }
    }

    // Check Eligibility
    const { data: member } = await supabase
        .from('memberships')
        .select('category')
        .eq('user_id', user.id)
        .single()

    const academicLevel = await getStudentLevel(supabase, user.id)
    const eligibility = isEligibleForCourse({
        membershipCategory: member?.category || 'student',
        academicLevel,
        courseLevel: course.level || 'Foundation'
    })

    if (!eligibility.eligible) {
        return {
            error: `Prerequisite Required: You must complete ${eligibility.requiredLevel} or upgrade your membership to enroll in this course.`
        }
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

    // Send Confirmation Email
    const { data: courseData } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single()

    if (courseData) {
        await sendEnrollmentEmail(user.email!, user.user_metadata?.full_name || "Student", courseData.title, courseId)
    }

    revalidatePath('/portal/student')
    return { success: true, enrollmentId: enrollment.id }
}

