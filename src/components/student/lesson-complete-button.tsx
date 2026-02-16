'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { markLessonComplete } from "@/actions/student/progress"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LessonCompleteButtonProps {
    courseId: string
    lessonId: string
    isCompleted?: boolean
}

export default function LessonCompleteButton({ courseId, lessonId, isCompleted = false }: LessonCompleteButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleComplete = async () => {
        if (isCompleted) return

        setLoading(true)
        const res = await markLessonComplete(courseId, lessonId)

        if (res.success) {
            toast.success("Progress saved!")
            router.refresh()
        } else {
            toast.error(res.error || "Failed to save progress")
        }
        setLoading(false)
    }

    return (
        <Button
            size="lg"
            className={`gap-2 ${isCompleted ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
            onClick={handleComplete}
            disabled={loading || isCompleted}
        >
            {loading ? (
                <>Saving... <Loader2 className="h-4 w-4 animate-spin" /></>
            ) : isCompleted ? (
                <>Completed <CheckCircle className="h-4 w-4" /></>
            ) : (
                <>Mark as Complete <CheckCircle className="h-4 w-4" /></>
            )}
        </Button>
    )
}
