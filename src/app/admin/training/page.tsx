import { getAdminCourses } from "@/actions/admin/get-admin-courses"
import { AdminTrainingClient } from "./AdminTrainingClient"

export const dynamic = 'force-dynamic'

export default async function AdminTrainingPage() {
    const result = await getAdminCourses()

    // Handle error case appropriately, perhaps log it
    // For now, default to empty array if error or no courses
    // Use type narrowing if result has 'courses' property
    const courses = ('courses' in result ? result.courses : []) || []

    return <AdminTrainingClient initialCourses={courses} />
}
