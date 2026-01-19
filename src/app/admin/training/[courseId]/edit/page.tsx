import { getCourseBySlug } from "@/actions/get-courses"
import { CourseForm } from "@/components/admin/course-form"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// We can fetch by ID directly here since we have the ID in params
async function getCourseById(id: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data } = await supabase.from('courses').select('*').eq('id', id).single()
    return data
}

export default async function EditCoursePage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId)

    if (!course) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                <p className="text-muted-foreground">Update course details and settings.</p>
            </div>

            <CourseForm mode="edit" course={course} />
        </div>
    )
}
