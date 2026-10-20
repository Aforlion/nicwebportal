/**
 * Level Utility Functions
 * Maps string-based levels to numeric ranks and checks eligibility.
 */

export const COURSE_LEVEL_MAP: Record<string, number> = {
    'Foundation': 1,
    'Level 1': 1,
    'Level 1: Foundation': 1,
    'Intermediate': 2,
    'Level 2': 2,
    'Level 2: Specialized': 2,
    'Advanced': 3,
    'Level 3': 3,
    'Level 3: Advanced': 3,
    'Specialist': 4,
    'Level 4': 4,
    'Level 4: Expert': 4,
    'Professional Update': 3,
    'Advanced Entrepreneurship (Level 5)': 5,
    'Level 5': 5,
}

export const MEMBERSHIP_LEVEL_MAP: Record<string, number> = {
    'student': 1,
    'associate': 2,
    'full': 3, // Professional Member
    'professional': 3,
    'fellow': 4,
    'facility_admin': 5,
}

/**
 * Returns the numeric rank of a level string.
 * Defaults to 1 if not found.
 */
export function getLevelRank(levelStr: string | null): number {
    if (!levelStr) return 1
    
    // Check for exact match
    if (COURSE_LEVEL_MAP[levelStr]) return COURSE_LEVEL_MAP[levelStr]
    
    // Check for "Level X" pattern
    const match = levelStr.match(/Level (\d+)/i)
    if (match) return parseInt(match[1])

    // Try case-insensitive keys
    const lowerLevel = levelStr.toLowerCase().trim()
    const foundKey = Object.keys(COURSE_LEVEL_MAP).find(k => k.toLowerCase() === lowerLevel)
    if (foundKey) return COURSE_LEVEL_MAP[foundKey]

    // Professional update default
    if (lowerLevel.includes('professional update') || lowerLevel.includes('refresher')) return 3
    if (lowerLevel.includes('agency') || lowerLevel.includes('entrepreneurship')) return 5

    return 1
}

export function isFundamentalsCourse({
    courseId,
    courseSlug,
    courseTitle,
    courseLevel
}: {
    courseId?: string | null
    courseSlug?: string | null
    courseTitle?: string | null
    courseLevel?: string | null
}): boolean {
    if (courseId && courseId === 'd040764a-e8c3-46c4-975d-7802c91fa1d6') return true
    if (courseSlug && courseSlug.toLowerCase() === 'fundamentals-of-professional-caregiving') return true
    if (courseTitle && courseTitle.toLowerCase().includes('fundamentals of professional caregiving')) return true
    if (courseLevel && (courseLevel.toLowerCase() === 'level 1: foundation' || courseLevel.toLowerCase() === 'foundation')) return true
    return false
}

export function isAgencyBusinessCourse({
    courseId,
    courseSlug,
    courseTitle
}: {
    courseId?: string | null
    courseSlug?: string | null
    courseTitle?: string | null
}): boolean {
    if (courseId && courseId === '52e1fde0-a8b2-4d56-b9a3-a75d27d7f8a5') return true
    if (courseSlug && courseSlug.toLowerCase().includes('nic-care-business-agency-development')) return true
    if (courseTitle && (courseTitle.toLowerCase().includes('care business') || courseTitle.toLowerCase().includes('agency development'))) return true
    return false
}

export function isRefresherCourse({
    courseId,
    courseSlug,
    courseTitle,
    courseLevel
}: {
    courseId?: string | null
    courseSlug?: string | null
    courseTitle?: string | null
    courseLevel?: string | null
}): boolean {
    if (courseId && courseId === '3d0e8a49-f43a-43f2-9734-70fe1eee421b') return true
    if (courseSlug && courseSlug.toLowerCase().includes('refresher')) return true
    if (courseTitle && courseTitle.toLowerCase().includes('refresher')) return true
    if (courseLevel && courseLevel.toLowerCase().includes('professional update')) return true
    return false
}

export interface CourseEligibilityParams {
    membershipCategory?: string | null
    academicLevel?: number
    courseLevel?: string | null
    courseSlug?: string | null
    courseId?: string | null
    courseTitle?: string | null
    userRole?: string | null
    isFacilityAdmin?: boolean
    userEmail?: string | null
}

export interface EligibilityResult {
    eligible: boolean
    requiredLevel?: string
    reason?: string
}

/**
 * Checks if a user is eligible for a course based on their membership category,
 * role, facility admin status, or their highest academic level completed.
 */
export function isEligibleForCourse(params: CourseEligibilityParams): EligibilityResult {
    const {
        membershipCategory = 'student',
        academicLevel = 0,
        courseLevel = 'Foundation',
        courseSlug,
        courseId,
        courseTitle,
        userRole = 'student',
        isFacilityAdmin = false,
        userEmail
    } = params

    // System Administrators are always eligible
    if (userRole === 'admin' || userRole === 'super_admin') {
        return { eligible: true }
    }

    const normCat = (membershipCategory || '').toLowerCase().trim()
    const normRole = (userRole || '').toLowerCase().trim()

    const isStudentUser = normCat === 'student' || normRole === 'student'
    const isProfessionalUser = ['full', 'professional', 'fellow'].includes(normCat) || ['member', 'professional'].includes(normRole)
    const isFacilityUser = isFacilityAdmin || ['facility_admin', 'facility', 'training_center'].includes(normRole)

    // Legacy bypass for specified student if present
    if (userEmail && userEmail.toLowerCase() === 'igboamaka958@gmail.com') {
        const courseRank = getLevelRank(courseLevel)
        if (courseRank <= 2) {
            return { eligible: true }
        }
    }

    const isFund = isFundamentalsCourse({ courseId, courseSlug, courseTitle, courseLevel })
    const isAgency = isAgencyBusinessCourse({ courseId, courseSlug, courseTitle })
    const isRefresher = isRefresherCourse({ courseId, courseSlug, courseTitle, courseLevel })

    // =========================================================================
    // RULE 1: STUDENT TIER (5,000 NGN Registration)
    // "Everybody that register with 5k should not be able to pay for any other course except Fundamental"
    // =========================================================================
    if (isStudentUser && !isProfessionalUser && !isFacilityUser) {
        if (isFund) {
            return { eligible: true }
        }
        return {
            eligible: false,
            requiredLevel: "Fundamentals of Professional Caregiving",
            reason: "Students registered under the ₦5,000 student membership are exclusively eligible for the Fundamentals of Professional Caregiving program. Advanced certifications, professional updates, and agency programs require completing the Fundamentals program or upgrading to a Professional Member."
        }
    }

    // =========================================================================
    // RULE 2: NIC CARE BUSINESS & AGENCY DEVELOPMENT PROGRAM (LEVEL 5)
    // "only those that have registered as Professional or are Facility admins can take the NIC Care Business & Agency Development Program"
    // =========================================================================
    if (isAgency) {
        if (isProfessionalUser || isFacilityUser) {
            return { eligible: true }
        }
        return {
            eligible: false,
            requiredLevel: "Professional Membership or Facility Administrator",
            reason: "The NIC Care Business & Agency Development Program is exclusively reserved for registered Professional Caregivers and accredited Facility Administrators."
        }
    }

    // =========================================================================
    // RULE 3: NIC CAREGIVER REFRESHER & COMPETENCY UPDATE PROGRAM
    // Professional Update course: strictly prohibited for students; allowed for registered professional caregivers.
    // =========================================================================
    if (isRefresher) {
        if (isProfessionalUser || isFacilityUser || normCat === 'associate') {
            return { eligible: true }
        }
        return {
            eligible: false,
            requiredLevel: "Professional Membership",
            reason: "The NIC Caregiver Refresher & Competency Update Program is a professional update course reserved for registered practicing caregivers. Students must take the Fundamentals program."
        }
    }

    // =========================================================================
    // RULE 4: GENERAL LEVEL HIERARCHY FOR SPECIALIZED / CPD COURSES
    // =========================================================================
    const courseRank = getLevelRank(courseLevel)
    const membershipRank = MEMBERSHIP_LEVEL_MAP[normCat] || (isProfessionalUser ? 3 : 1)

    // Facility Admins can access all levels
    if (isFacilityUser) {
        return { eligible: true }
    }

    // Professional members can access Level 1, 2, 3, and specialized CPDs
    if (membershipRank >= courseRank) {
        return { eligible: true }
    }

    // Academic progression: completed previous level
    if (academicLevel >= courseRank - 1 && courseRank <= 3) {
        return { eligible: true }
    }

    let required = "Level 1"
    if (courseRank === 2) required = "Level 1 (Foundation)"
    if (courseRank === 3) required = "Level 2 (Intermediate)"
    if (courseRank === 4) required = "Level 3 (Advanced)"
    if (courseRank >= 5) required = "Professional Membership or Facility Administrator"

    return {
        eligible: false,
        requiredLevel: required,
        reason: `This course requires you to complete ${required} first, or upgrade your membership category.`
    }
}
