import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ShieldCheck,
    CreditCard,
    Clock,
    Calendar,
    Download,
    Mail,
    ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

export default function MemberDashboard() {
    return (
        <div className="space-y-8">
            {/* Membership Card Overview */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="bg-gradient-to-br from-secondary to-slate-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck className="h-40 w-40" />
                        </div>
                        <CardContent className="p-8 relative">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <Badge className="bg-accent text-secondary font-bold hover:bg-accent border-none px-3">
                                            FULL MEMBER (MNIC)
                                        </Badge>
                                        <Badge className="bg-amber-400 text-secondary font-black hover:bg-amber-500 border-none px-3 animate-pulse">
                                            FOUNDING MEMBER
                                        </Badge>
                                    </div>
                                    <h1 className="text-3xl font-bold">Grace Obi</h1>
                                    <p className="text-slate-300">National ID: NIC-FND-5502</p>
                                </div>
                                <div className="h-20 w-20 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                    <ShieldCheck className="h-12 w-12 text-accent" />
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-3 border-t border-white/10 pt-8">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className="text-emerald-400 font-bold flex items-center gap-1 mt-1">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        ACTIVE
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</p>
                                    <p className="font-bold text-slate-200 mt-1">March 2024</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry</p>
                                    <p className="font-bold text-slate-200 mt-1">March 30, 2025</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-secondary">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 p-6 pt-0">
                            <Button className="w-full bg-primary justify-start" asChild>
                                <Link href="/portal/member/id-card">
                                    <Download className="mr-2 h-4 w-4" /> Download Digital ID
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/portal/member/payments">
                                    <CreditCard className="mr-2 h-4 w-4" /> Pay Annual Dues
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/portal/member/profile">
                                    <Mail className="mr-2 h-4 w-4" /> Update Contact Info
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* CPD & Stats */}
            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-xl font-bold text-secondary">CPD Progress</CardTitle>
                            <p className="text-sm text-muted-foreground">Cycle: 2024 - 2025</p>
                        </div>
                        <Clock className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-bold text-secondary">18 <span className="text-sm font-normal text-muted-foreground">/ 30 Credits</span></span>
                            <span className="text-sm font-bold text-primary">60%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 mb-6">
                            <div className="bg-primary h-full rounded-full w-[60%]" />
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-secondary">Recent Logs</p>
                            {[
                                { title: "Infection Control Update", date: "Jan 05, 2024", points: "+5" },
                                { title: "Dementia Ethics Workshop", date: "Dec 12, 2023", points: "+8" },
                            ].map((log) => (
                                <div key={log.title} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-lg">
                                    <div>
                                        <p className="font-medium text-secondary">{log.title}</p>
                                        <p className="text-xs text-muted-foreground">{log.date}</p>
                                    </div>
                                    <span className="font-bold text-primary">{log.points}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-secondary">Next Renewal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Renewal Date</p>
                                <p className="text-xl font-bold text-secondary">March 31, 2025</p>
                                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded w-fit mt-1">NO DUES OUTSTANDING</p>
                            </div>
                        </div>
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <h4 className="font-bold text-secondary mb-2 flex items-center gap-2">
                                Professional Notice
                                <ArrowUpRight className="h-4 w-4" />
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                As a Full Member (MNIC), you are required to complete at least 30 CPD hours annually to maintain your registry status. Ensure all external certificates are uploaded by year-end.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
