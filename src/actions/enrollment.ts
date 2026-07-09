'use server'

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
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
            courseLevel: course?.level || 'Foundation',
            userEmail: user.email
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
                status: 'active',
                payment_status: 'paid',
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
        courseLevel: course.level || 'Foundation',
        userEmail: user.email
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
            status: 'active',
            payment_status: 'free',
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

/**
 * Called by the Paystack webhook after a successful charge.success event with
 * payment_type === 'course_enrollment'. Uses the service-role client so it
 * can operate without a user session.
 */
export async function enrollFromWebhookAction(
    reference: string,
    courseId: string,
    customerEmail: string
): Promise<{ success: boolean; message: string }> {

    // Build the admin/service-role client (no user session in webhook context)
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Verify the transaction with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
        console.error("[enrollFromWebhookAction] Missing PAYSTACK_SECRET_KEY")
        return { success: false, message: "Server configuration error." }
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${paystackSecret}` }
    })
    const verifyData = await verifyRes.json()

    if (!verifyData.status || verifyData.data?.status !== 'success') {
        console.error("[enrollFromWebhookAction] Paystack verification failed", { reference, verifyData })
        return { success: false, message: "Payment verification failed." }
    }

    // 2. Find the user by email via profiles table (admin bypasses RLS)
    const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('id, full_name')
        .eq('email', customerEmail)
        .maybeSingle()

    if (profileError || !profile) {
        console.error("[enrollFromWebhookAction] User profile not found", { customerEmail, reference })
        return { success: false, message: "User not found." }
    }

    const userId = profile.id

    // 3. Idempotency guard — bail if already enrolled
    const { data: existing } = await adminClient
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()

    if (existing) {
        console.log("[enrollFromWebhookAction] Already enrolled, skipping duplicate.", { userId, courseId, reference })
        return { success: true, message: "Already enrolled." }
    }

    // 4. Create the enrollment
    const { error: enrollError } = await adminClient
        .from('enrollments')
        .insert({
            user_id: userId,
            course_id: courseId,
            payment_reference: reference,
            status: 'active',
            payment_status: 'paid',
            progress: 0,
            completed_lessons: [],
            enrolled_at: new Date().toISOString()
        })

    if (enrollError) {
        console.error("[enrollFromWebhookAction] Enrollment insert failed", { enrollError, userId, courseId, reference })
        return { success: false, message: "Failed to create enrollment." }
    }

    // 5. Send confirmation email (non-fatal if it fails)
    const { data: courseData } = await adminClient
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .maybeSingle()

    if (courseData) {
        try {
            await sendEnrollmentEmail(customerEmail, profile.full_name || "Student", courseData.title, courseId)
        } catch (emailErr) {
            console.error("[enrollFromWebhookAction] Confirmation email failed", emailErr)
        }
    }

    console.log("[enrollFromWebhookAction] Enrollment created successfully", { userId, courseId, reference })
    return { success: true, message: "Enrolled successfully." }
}


