import { getFacilityInspectionDetails } from "@/actions/admin/inspection-scoring"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { PillarScoringTool } from "@/components/admin/pillar-scoring-tool"
import { ShieldCheck, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function FacilityInspectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/auth/login")

    const { facility, previousScores, error } = await getFacilityInspectionDetails(id)

    if (error || !facility) return notFound()

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Button variant="ghost" size="icon" asChild>
                      <Link href="/admin/inspections">
                         <ArrowLeft className="h-5 w-5" />
                      </Link>
                   </Button>
                   <div>
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Inspection in Progress</span>
                        </div>
                        <h1 className="text-3xl font-bold text-secondary">{facility.name}</h1>
                        <p className="text-sm text-muted-foreground">Registration ID: {facility.registration_number}</p>
                   </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-50">Assigned Official</p>
                    <p className="font-bold text-secondary">{user.email?.split('@')[0]}</p>
                </div>
            </div>

            <PillarScoringTool facilityId={facility.id} inspectorId={user.id} />
        </div>
    )
}
