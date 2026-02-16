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
