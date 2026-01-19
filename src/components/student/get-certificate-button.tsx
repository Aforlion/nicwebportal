'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { issueCertificate } from "@/actions/student/certificate"
import { Loader2, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function GetCertificateButton({ courseId }: { courseId: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleGetCertificate = async () => {
        setIsLoading(true)
        try {
            const res = await issueCertificate(courseId)

            if (res.success && res.code) {
                toast.success("Certificate issued successfully!")
                // Open in new tab
                window.open(`/certificates/${res.code}`, '_blank')
            } else {
                toast.error(res.error || "Failed to issue certificate")
            }
        } catch (e) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            size="lg"
            onClick={handleGetCertificate}
            disabled={isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
            ) : (
                <>
                    <Award className="mr-2 h-4 w-4" /> Get Certificate
                </>
            )}
        </Button>
    )
}
