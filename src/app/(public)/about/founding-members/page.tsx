import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, Search, ShieldCheck } from "lucide-react"
import Image from "next/image"

export const dynamic = "force-dynamic"

async function getFoundingMembers() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Fetch memberships that are founding AND paid recapitalization
    // We join with profiles to get details
    const { data, error } = await supabase
        .from('memberships')
        .select(`
            *,
            profiles:user_id (
                full_name,
                passport_url
            )
        `)
        .eq('is_founding', true)
        .eq('paid_recapitalization', true)
        .eq('is_active', true)

    if (error) {
        console.error("Error fetching founders:", error)
        return []
    }

    return data || []
}

export default async function FoundingMembersPage() {
    const founders = await getFoundingMembers()

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <section className="bg-secondary py-24 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-20" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-amber-500/20">
                        <Crown className="h-8 w-8 text-amber-500" />
                    </div>
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl font-serif">
                        Founding Members
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-300 md:text-xl leading-relaxed">
                        We honor the visionaries and pioneers who laid the foundation for the National Institute of Caregivers. Their commitment to excellence has shaped the future of caregiving in Nigeria.
                    </p>
                </div>
            </section>

            {/* List Section */}
            <section className="container mx-auto px-4 -mt-10 relative z-20">
                {founders.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
                        <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-secondary mb-2">The Roll of Honor is Updating</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            The official list of recapitalized founding members is currently being compiled and verified. Please check back soon.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {founders.map((member: any) => (
                            <Card key={member.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white">
                                <CardContent className="p-0">
                                    <div className="aspect-square relative bg-slate-100">
                                        {member.profiles?.passport_url ? (
                                            <Image
                                                src={member.profiles.passport_url}
                                                alt={member.profiles.full_name || "Founding Member"}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary/5 text-secondary/20">
                                                <ShieldCheck className="w-20 h-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <Badge className="bg-amber-500 hover:bg-amber-600 border-none text-white mb-2 px-3 py-1 shadow-sm">
                                                <Crown className="w-3 h-3 mr-1 fill-current" /> Founding Member
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-6 text-center">
                                        <h3 className="text-lg font-bold text-secondary mb-1 line-clamp-1">
                                            {member.profiles?.full_name || "Unknown Member"}
                                        </h3>
                                        <p className="text-sm text-primary font-medium uppercase tracking-wide text-xs mt-2">
                                            {member.category || "Founding Member"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
