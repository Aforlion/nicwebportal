import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"

export default function InspectionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Inspections & Compliance</h1>
                <p className="text-muted-foreground">Track inspection history and compliance status.</p>
            </div>

            <Card className="border-dashed border-2">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <History className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>No Inspections Yet</CardTitle>
                    <CardDescription>
                        Your facility's inspection records will appear here once scheduled.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pb-8">
                    The electronic inspection tracking system is coming soon.
                </CardContent>
            </Card>
        </div>
    )
}
