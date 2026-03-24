import { getAccreditedFacilities } from "@/actions/public-registry"
import { RegistryClient } from "@/components/registry-client"
import { Building2, ShieldCheck, Map } from "lucide-react"
import Image from "next/image"

export default async function RegistryPage() {
    const facilities = await getAccreditedFacilities()

    return (
        <div className="min-h-screen bg-slate-50/50 relative overflow-hidden">
            {/* Background Watermark */}
            <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                <Image 
                    src="/coat-of-arm.png" 
                    alt="" 
                    width={800} 
                    height={800} 
                    className="object-contain"
                />
            </div>

            <div className="relative z-10">
            {/* Hero Section */}
            <div className="bg-secondary px-6 py-16 md:py-24 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 opacity-5 pointer-events-none -translate-x-1/4 -translate-y-1/4">
                    <Image src="/coat-of-arm.png" alt="" width={300} height={300} />
                </div>
                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full text-white/90 text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                        <Image src="/logo.jpg" alt="NIC" width={20} height={20} className="rounded-sm" />
                        <div className="h-4 w-[1px] bg-white/20" />
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Official NIC Accreditation Registry
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                        Find Certified <span className="text-primary italic">Institutional</span> Care
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto font-medium">
                        Search the official directory of accredited nursing homes, hospitals, and care agencies 
                        verified against the National 6-Pillar Standards.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-10 pb-24">
                <RegistryClient initialFacilities={facilities} />
                
                <div className="mt-20 p-8 rounded-3xl bg-white border border-primary/10 shadow-sm flex flex-col md:flex-row items-center gap-8">
                   <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck className="h-8 w-8" />
                   </div>
                   <div className="flex-grow">
                      <h3 className="text-xl font-bold text-secondary mb-1">Verify an Institution?</h3>
                      <p className="text-sm text-muted-foreground">Every accredited facility is issued a digital QR license. Scan the license at the facility premises to verify real-time compliance status.</p>
                   </div>
                   <div className="flex gap-4">
                      <button className="px-6 py-3 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all">Reporting Issues</button>
                   </div>
                </div>
            </div>
        </div>
        </div>
    )
}
