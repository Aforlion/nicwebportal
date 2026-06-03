import { z } from "zod"

export const CourseSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).optional(),
    price: z.number().min(0),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Professional', 'General', 'Foundation', 'Certification', 'Specialty']),
    duration_hours: z.number().min(0),
    is_published: z.boolean().default(false),
    thumbnail_url: z.string().url().optional().or(z.literal('')),
})

export const ModuleSchema = z.object({
    course_id: z.string().uuid(),
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    completion_requirements: z.string().optional(),
    sort_order: z.number().int().min(0),
})

export const LessonSchema = z.object({
    module_id: z.string().uuid(),
    title: z.string().min(3).max(100),
    content: z.string().optional(),
    video_url: z.string().url().optional().or(z.literal('')),
    duration_minutes: z.number().int().min(0),
    is_preview: z.boolean().default(false),
    sort_order: z.number().int().min(0),
})
export const AssessmentSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    passing_score: z.number().int().min(0).max(100),
    questions: z.array(z.object({
        id: z.string(),
        text: z.string().min(1),
        type: z.enum(['multiple_choice', 'true_false', 'essay', 'report']),
        options: z.array(z.object({
            id: z.string(),
            text: z.string()
        })).optional(),
        correctDetails: z.object({
            answer: z.string()
        }).optional(),
        explanation: z.string().optional()
    })).min(1)
})

/**
 * Validates the answers payload submitted by a student.
 * - Keys are question IDs (UUIDs)
 * - Values are the student's selected/written answers (string, max 5,000 chars)
 * - Unknown keys are stripped (passthrough disabled)
 */
export const AnswersSchema = z.record(
    z.string().uuid({ message: "Answer key must be a valid question UUID" }),
    z.string().max(5000, { message: "Answer exceeds maximum allowed length" })
)

export type Answers = z.infer<typeof AnswersSchema>


export const FoundingRegistrationSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(5, "Address is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
})

export const IndividualRegistrationSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    category: z.enum(['student', 'associate', 'full', 'professional']),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export const FacilityRegistrationSchema = z.object({
    facilityName: z.string().min(2, "Facility name is required"),
    regNumber: z.string().min(1, "Registration number is required"),
    tin: z.string().optional(),
    facilityType: z.string().min(1, "Facility type is required"),
    email: z.string().email("Invalid facility email"),
    phone: z.string().min(10, "Facility phone is required"),
    address: z.string().min(5, "Facility address is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    capacity: z.string().or(z.number()),
    ownerEmail: z.string().email("Owner email is required"),
    ownerFullName: z.string().min(2, "Owner name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})
