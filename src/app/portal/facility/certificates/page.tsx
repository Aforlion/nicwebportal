import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"

export default function FacilityCertificatesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Facility Certificates</h1>
                <p className="text-muted-foreground">Access and download your registration certificates and accreditation documents.</p>
            </div>

            <Card className="border-dashed border-2">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Award className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Certificates Section</CardTitle>
                    <CardDescription>
                        Digital copies of your certificates are being generated.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pb-8">
                    You will be able to download your official registration documents here.
                </CardContent>
            </Card>
        </div>
    )
}
