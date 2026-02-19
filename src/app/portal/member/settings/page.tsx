import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"

export default function MemberSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Settings</h1>
                <p className="text-muted-foreground">Manage your membership preferences and security.</p>
            </div>

            <Card className="border-dashed border-2">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <SettingsIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Settings under development</CardTitle>
                    <CardDescription>
                        Membership settings and ID card preferences will be available shortly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pb-8">
                    We are working hard to bring you a full-featured portal.
                </CardContent>
            </Card>
        </div>
    )
}
