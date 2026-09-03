import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, ShieldCheck, ExternalLink, Calendar, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function MemberCertificatesPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch all certificates associated with the member
    const { data: certificates, error } = await supabase
        .from('certificates')
        .select(`
            *,
            programs (title),
            courses (title)
        `)
        .eq('user_id', user.id)

    // Also fetch membership to construct membership certificate if active
    const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">My Official Certificates</h1>
                    <p className="text-muted-foreground">Access, view, and download your official NIC licenses & credentials.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/portal/member/id-card">
                        <Award className="mr-2 h-4 w-4 text-primary" /> View Digital Member ID
                    </Link>
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {certificates && certificates.length > 0 ? (
                    certificates.map((cert: any) => {
                        const isNCNA = cert.type === 'ncna' || cert.certificate_number?.startsWith('NCNA')
                        const title = (cert.programs as any)?.title || (cert.courses as any)?.title || cert.course_level || (isNCNA ? "National Certified Nursing Assistant (NCNA)" : "NIC Certification")

                        return (
                            <Card key={cert.id} className="overflow-hidden border-2 border-primary/10 group hover:shadow-lg transition-all">
                                <div className="h-2 bg-gradient-to-r from-[#b45309] via-[#f59e0b] to-secondary" />
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-[#fef3c7] p-3 rounded-2xl mb-4 text-[#b45309]">
                                            <Award className="h-10 w-10" />
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 uppercase font-bold text-[10px] tracking-widest border border-emerald-300">
                                            <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" /> Verified Credential
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl text-secondary">{title}</CardTitle>
                                    <CardDescription className="font-mono text-xs text-slate-500 font-bold">
                                        {cert.certificate_number}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Issue Date</p>
                                            <p className="font-bold text-secondary flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" /> {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Verified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Credential Status</p>
                                            <p className="font-bold text-emerald-700 flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active & Valid
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-1 border">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Authority</p>
                                        <p className="text-xs font-semibold text-slate-700">National Institute of Caregivers (NIC Nigeria Registry Board)</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-3 pt-0">
                                    <Button className="flex-grow bg-[#D97706] hover:bg-[#b45309] text-white font-bold" asChild>
                                        <Link href={`/certificates/${cert.certificate_number}`} target="_blank">
                                            <Download className="mr-2 h-4 w-4" /> View & Download Certificate
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href={`/certificates/${cert.certificate_number}`} target="_blank" title="Public Verification Link">
                                            <ExternalLink className="h-4 w-4 text-primary" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                ) : (
                    <div className="lg:col-span-2 py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8">
                        <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-bold text-secondary">No Certificates Found Yet</h3>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
                            Once your professional certifications, NCNA license, or program completions are processed by the registry board, your downloadable certificates will appear here.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <Button className="bg-primary" asChild>
                                <Link href="/portal/member/profile">View Profile Status</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/portal/student">Access Learning Portal</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Official Verification Information Banner */}
            <div className="p-6 bg-secondary text-white rounded-3xl relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-sm">
                    <ShieldCheck className="h-40 w-40" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-amber-400">
                        <ShieldCheck className="h-5 w-5 text-amber-400" />
                        Electronic Validity & Public QR Verification
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        All official NIC certificates are issued electronically with scannable QR verification codes, embedded gold registry seals, and digital signatures. Employers and licensing boards can verify credentials anytime at <span className="text-amber-400 font-mono underline">www.nicnigeria.org/verify</span>.
                    </p>
                </div>
            </div>
        </div>
    )
}
