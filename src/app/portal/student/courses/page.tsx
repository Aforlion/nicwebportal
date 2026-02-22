import { getStudentCoursesData } from "@/actions/student/get-courses"
import StudentCoursesClient from "./StudentCoursesClient"

export const dynamic = 'force-dynamic'

export default async function StudentCoursesPage() {
    const { myCourses, availableCourses, error } = await getStudentCoursesData()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Courses</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <StudentCoursesClient
            initialMyCourses={myCourses || []}
            initialAvailableCourses={availableCourses || []}
        />
    )
}
