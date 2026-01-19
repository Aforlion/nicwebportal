'use client'

import { Button } from "@/components/ui/button"
import { enrollFreeCourse } from "@/actions/enrollment"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface EnrollFreeButtonProps {
    courseId: string
}

export default function EnrollFreeButton({ courseId }: EnrollFreeButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleEnroll = async () => {
        setIsLoading(true)
        try {
            const result = await enrollFreeCourse(courseId)

            if (result.success) {
                toast.success("Enrolled successfully!")
                router.push(`/portal/student/courses/${courseId}`)
            } else {
                toast.error(result.error || "Enrollment failed.")
                setIsLoading(false)
            }
        } catch (e) {
            toast.error("An error occurred.")
            setIsLoading(false)
        }
    }

    return (
        <Button
            size="lg"
            className="w-full text-lg font-semibold h-12"
            onClick={handleEnroll}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...
                </>
            ) : (
                <>
                    Start Learning Now <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </Button>
    )
}
