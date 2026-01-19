import { Award } from "lucide-react"
import GetCertificateButton from "./get-certificate-button"

export default function CourseCompletionCard({ courseId }: { courseId: string }) {
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <Award className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-bold text-yellow-900">Course Completed!</h2>
            <p className="text-yellow-800">
                Congratulations! You have finished all lessons in this course.
            </p>

            <div className="pt-4 max-w-xs mx-auto">
                <GetCertificateButton courseId={courseId} />
            </div>
        </div>
    )
}
