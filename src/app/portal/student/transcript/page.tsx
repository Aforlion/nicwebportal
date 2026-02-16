import { getStudentTranscript } from "@/actions/student/certificate"
import TranscriptClient from "./TranscriptClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function StudentTranscriptPage() {
    const data = await getStudentTranscript()

    if ('error' in data) {
        return (
            <div className="max-w-5xl mx-auto p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {data.error}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8">
            <TranscriptClient data={data as any} />
        </div>
    )
}
