/**
 * Level Utility Functions
 * Maps string-based levels to numeric ranks and checks eligibility.
 */

export const COURSE_LEVEL_MAP: Record<string, number> = {
    'Foundation': 1,
    'Level 1': 1,
    'Intermediate': 2,
    'Level 2': 2,
    'Advanced': 3,
    'Level 3': 3,
    'Specialist': 4,
    'Level 4': 4,
}

export const MEMBERSHIP_LEVEL_MAP: Record<string, number> = {
    'student': 1,
    'associate': 2,
    'full': 3, // Professional Member
    'professional': 3,
    'fellow': 4,
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
    const lowerLevel = levelStr.toLowerCase()
    const foundKey = Object.keys(COURSE_LEVEL_MAP).find(k => k.toLowerCase() === lowerLevel)
    if (foundKey) return COURSE_LEVEL_MAP[foundKey]

    return 1
}

/**
 * Checks if a user is eligible for a course based on their membership category 
 * OR their highest academic level completed.
 */
export function isEligibleForCourse({
    membershipCategory,
    academicLevel,
    courseLevel,
    userEmail
}: {
    membershipCategory: string,
    academicLevel: number,
    courseLevel: string,
    userEmail?: string
}): { eligible: boolean; requiredLevel?: string } {
    // Unique bypass for igboamaka958@gmail.com to take Level 2 courses
    if (userEmail && userEmail.toLowerCase() === 'igboamaka958@gmail.com') {
        const courseRank = getLevelRank(courseLevel)
        if (courseRank <= 2) {
            return { eligible: true }
        }
    }

    const courseRank = getLevelRank(courseLevel)
    const membershipRank = MEMBERSHIP_LEVEL_MAP[membershipCategory] || 1
    
    // 1. Check Membership Eligibility
    // Associate (2) can take up to Level 2.
    // Pro (3) can take up to Level 3.
    if (membershipRank >= courseRank) {
        return { eligible: true }
    }

    // 2. Check Academic Progression Eligibility
    // Student (1) can take Level 1.
    // To take Level N, must have completed Level N-1.
    if (academicLevel >= courseRank - 1) {
        return { eligible: true }
    }

    // Determine what's missing
    let required = "Level 1"
    if (courseRank === 2) required = "Level 1 (Foundation)"
    if (courseRank === 3) required = "Level 2 (Intermediate)"
    if (courseRank === 4) required = "Level 3 (Advanced)"

    return { 
        eligible: false, 
        requiredLevel: required 
    }
}
