import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AccreditationForm } from "@/components/facility/accreditation-form"
import { Building2, ShieldCheck, ChevronRight } from "lucide-react"

export default async function AccreditationPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/auth/login")

    const { data: facility } = await supabase
        .from('facilities')
        .select('id, name, status')
        .eq('owner_id', user.id)
        .single()

    if (!facility) redirect("/portal/facility")

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Regulatory Compliance</span>
                    </div>
                    <h1 className="text-3xl font-bold text-secondary">NIC Facility Accreditation</h1>
                    <p className="text-muted-foreground">Comprehensive Institutional Assessment for {facility.name}</p>
                </div>
                <div className="p-3 bg-white rounded-full border shadow-sm">
                    <Building2 className="h-8 w-8 text-primary/40" />
                </div>
            </div>

            <AccreditationForm facilityId={facility.id} />
            
            <div className="bg-secondary/5 rounded-xl p-6 border border-secondary/10">
                <h3 className="text-sm font-bold text-secondary mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    What happens next?
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-[11px] leading-relaxed text-muted-foreground">
                   <div className="space-y-1">
                       <p className="font-bold text-secondary text-[12px]">1. Application Review</p>
                       <p>NIC Registry officers will sanity check your documents and policy links within 48 hours.</p>
                   </div>
                   <div className="space-y-1">
                       <p className="font-bold text-secondary text-[12px]">2. Physical Inspection</p>
                       <p>An unannounced or scheduled site visit will be conducted to verify your operational standards.</p>
                   </div>
                   <div className="space-y-1">
                       <p className="font-bold text-secondary text-[12px]">3. Grading & Listing</p>
                       <p>Based on the inspection, you'll receive a Level (1-3) and a Grade (A-C) and be listed in the Registry.</p>
                   </div>
                </div>
            </div>
        </div>
    )
}
