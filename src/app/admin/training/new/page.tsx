import { CourseForm } from "@/components/admin/course-form"

export default function NewCoursePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
                <p className="text-muted-foreground">Fill in the details to create a new training module.</p>
            </div>

            <CourseForm mode="create" />
        </div>
    )
}
