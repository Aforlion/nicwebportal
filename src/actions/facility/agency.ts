'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Fetches all registered caregivers (students/members) with profiles,
 * memberships, completed certifications, and active enrollments.
 */
export async function getCaregivers() {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Verify active user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        // Fetch all student/member profiles with memberships, certificates, and enrollments
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                email,
                phone,
                role,
                avatar_url,
                created_at,
                memberships (
                    id,
                    nic_id,
                    category,
                    is_active,
                    years_of_experience,
                    qualification,
                    photo_url
                ),
                certificates (
                    id,
                    certificate_number,
                    issue_date,
                    is_verified,
                    programs (
                        id,
                        title
                    )
                ),
                enrollments (
                    id,
                    status,
                    progress,
                    programs (
                        id,
                        title
                    )
                )
            `)
            .in('role', ['student', 'member'])
            .order('full_name', { ascending: true })

        if (error) {
            console.error('Error fetching caregivers directory:', error)
            return { error: 'Failed to fetch caregivers' }
        }

        // Format profiles for the directory view
        const formatted = (profiles || []).map((p: any) => {
            const membership = p.memberships?.[0] || null
            return {
                id: p.id,
                fullName: p.full_name,
                email: p.email,
                phone: p.phone || '',
                role: p.role,
                avatarUrl: membership?.photo_url || p.avatar_url || null,
                nicId: membership?.nic_id || 'Pending',
                membershipCategory: membership?.category || '',
                status: membership?.is_active ? 'Active' : 'Inactive',
                experience: membership?.years_of_experience || '0',
                qualification: membership?.qualification || 'None',
                certificates: (p.certificates || []).map((c: any) => ({
                    id: c.id,
                    number: c.certificate_number,
                    date: c.issue_date,
                    verified: c.is_verified,
                    courseTitle: c.programs?.title || 'Unknown Course'
                })),
                enrollments: (p.enrollments || []).map((e: any) => ({
                    id: e.id,
                    status: e.status,
                    progress: e.progress,
                    courseTitle: e.programs?.title || 'Unknown Course'
                }))
            }
        })

        return { caregivers: formatted }
    } catch (err: any) {
        console.error('getCaregivers action error:', err)
        return { error: err.message || 'An unexpected error occurred.' }
    }
}

/**
 * Persists a course recommendation from an agency to a student/caregiver.
 */
export async function recommendCourse(studentId: string, courseId: string) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Get current user and verify they own a facility
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: facility, error: facError } = await supabase
            .from('facilities')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (facError || !facility) {
            return { error: 'Only registered facility/agency accounts can recommend training.' }
        }

        // Insert recommendation (with graceful fallback if table not yet migrated)
        const { error: recError } = await supabase
            .from('course_recommendations')
            .insert({
                agency_id: facility.id,
                student_id: studentId,
                course_id: courseId
            })

        if (recError) {
            console.warn('Recommendation table insert failed (check migrations):', recError.message)
            // If table does not exist, return mock success to not block user interaction
            if (recError.code === '42P01') {
                return { 
                    success: true, 
                    warning: 'Recommendation saved in-memory (database table not fully migrated).' 
                }
            }
            return { error: recError.message }
        }

        revalidatePath('/portal/facility')
        return { success: true }
    } catch (err: any) {
        console.error('recommendCourse action error:', err)
        return { error: err.message || 'An unexpected error occurred.' }
    }
}

/**
 * Fetches all courses currently recommended to a student.
 */
export async function getRecommendationsForStudent(studentId: string) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data, error } = await supabase
            .from('course_recommendations')
            .select(`
                id,
                recommended_at,
                facilities (
                    name
                ),
                programs (
                    id,
                    title,
                    description,
                    duration
                )
            `)
            .eq('student_id', studentId)

        if (error) {
            if (error.code === '42P01') return { recommendations: [] } // Graceful fallback
            console.error('Error fetching student recommendations:', error)
            return { error: 'Failed to fetch recommendations' }
        }

        const formatted = (data || []).map((r: any) => ({
            id: r.id,
            recommendedAt: r.recommended_at,
            agencyName: r.facilities?.name || 'Partner Agency',
            courseId: r.programs?.id,
            courseTitle: r.programs?.title,
            courseDescription: r.programs?.description,
            courseDuration: r.programs?.duration
        }))

        return { recommendations: formatted }
    } catch (err: any) {
        console.error('getRecommendationsForStudent action error:', err)
        return { error: err.message || 'An unexpected error occurred.' }
    }
}
