import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"

export default function FacilitySettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Facility Settings</h1>
                <p className="text-muted-foreground">Manage your facility profile and administrative preferences.</p>
            </div>

            <Card className="border-dashed border-2">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <SettingsIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Settings Portal</CardTitle>
                    <CardDescription>
                        Administrative settings are currently being updated.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pb-8">
                    Contact the NIC registry if you need to update your facility details urgently.
                </CardContent>
            </Card>
        </div>
    )
}
