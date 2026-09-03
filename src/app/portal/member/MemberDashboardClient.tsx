"use client"

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
    ArrowUpRight,
    GraduationCap,
    BookOpen,
    AlertCircle,
    ArrowRight,
    Award
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MemberDashboardClientProps {
    data: {
        member: {
            name: string
            nicId: string
            category: string
            status: string
            joined: string
            expiry: string
            renewalDate: string
        }
        cpd: {
            points: number
            target: number
            progress: number
            logs: Array<{ title: string; date: string; points: string }>
        }
        hasOutstandingDues: boolean
        profileComplete: boolean
        activeEnrollments?: Array<{
            id: string
            courseId: string
            title: string
            thumbnail: string
            status: string
        }>
    }
}

export default function MemberDashboardClient({ data }: MemberDashboardClientProps) {
    const { member, cpd, hasOutstandingDues, profileComplete } = data

    return (
        <div className="space-y-8">
            {/* Profile Completion Banner */}
            {!profileComplete && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-900">Complete your profile</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                Add your address and a profile photo to unlock full member benefits and speed up your NIC ID approval.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/portal/member/profile"
                        className="flex items-center gap-1.5 shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
                    >
                        Complete Profile <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
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
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        <Badge variant="secondary" className="font-bold border-none px-3 uppercase text-secondary">
                                            {member.category === 'full' ? 'PROFESSIONAL' : member.category} MEMBER
                                        </Badge>
                                        {member.nicId?.includes('FND') && (
                                            <Badge variant="warning" className="font-black border-none px-3 animate-pulse text-secondary">
                                                FOUNDING MEMBER
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-bold">{member.name}</h1>
                                    <p className="text-slate-300">National ID: {member.nicId || 'Pending Assignment'}</p>
                                </div>
                                <div className="h-20 w-20 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                    <ShieldCheck className="h-12 w-12 text-accent" />
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-3 border-t border-white/10 pt-8">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                    <div className="mt-1">
                                        <Badge
                                            variant={member.status === 'ACTIVE' ? 'success' : 'warning'}
                                            className="font-bold flex items-center gap-1 w-fit"
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {member.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</p>
                                    <p className="font-bold text-slate-200 mt-1">{member.joined}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry</p>
                                    <p className="font-bold text-slate-200 mt-1">{member.expiry}</p>
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
                            <Button variant="outline" className="w-full justify-start border-[#D97706]/30 hover:bg-[#D97706]/10 text-[#B45309] font-bold" asChild>
                                <Link href="/portal/member/certificates">
                                    <Award className="mr-2 h-4 w-4 text-[#D97706]" /> View / Download Certificates
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/portal/member/payments">
                                    <CreditCard className="mr-2 h-4 w-4" /> Pay Annual Dues
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-primary/20 hover:bg-primary/5 text-primary" asChild>
                                <Link href="/portal/member/profile">
                                    <Mail className="mr-2 h-4 w-4" /> Update Contact Info
                                </Link>
                            </Button>
                            {data.activeEnrollments && data.activeEnrollments.length > 0 && (
                                <Button variant="secondary" className="w-full justify-start bg-accent/10 text-accent hover:bg-accent/20" asChild>
                                    <Link href="/portal/student">
                                        <GraduationCap className="mr-2 h-4 w-4" /> Go to Learning Portal
                                    </Link>
                                </Button>
                            )}
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
                            <p className="text-sm text-muted-foreground">Cycle: {new Date().getFullYear()} - {new Date().getFullYear() + 1}</p>
                        </div>
                        <Clock className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-bold text-secondary">{cpd.points} <span className="text-sm font-normal text-muted-foreground">/ {cpd.target} Credits</span></span>
                            <span className="text-sm font-bold text-primary">{cpd.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 mb-6">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${cpd.progress}%` }}
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-secondary">Recent Logs</p>
                            {cpd.logs.length > 0 ? (
                                cpd.logs.map((log, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-lg">
                                        <div>
                                            <p className="font-medium text-secondary">{log.title}</p>
                                            <p className="text-xs text-muted-foreground">{log.date}</p>
                                        </div>
                                        <span className="font-bold text-primary">{log.points}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-xs italic">
                                    No approved CPD activities logged yet.
                                </div>
                            )}
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
                                <p className="text-xl font-bold text-secondary">{member.expiry}</p>
                                {hasOutstandingDues ? (
                                    <Badge variant="warning" className="mt-1 font-bold">DUES OUTSTANDING</Badge>
                                ) : (
                                    <Badge variant="success" className="mt-1 font-bold">NO DUES OUTSTANDING</Badge>
                                )}
                            </div>
                        </div>
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <h4 className="font-bold text-secondary mb-2 flex items-center gap-2">
                                Professional Notice
                                <ArrowUpRight className="h-4 w-4" />
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                As a {member.category} Member, you are required to complete at least {cpd.target} CPD hours annually to maintain your registry status. Ensure all external certificates are uploaded by year-end.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Active Training (Unification) */}
            {data.activeEnrollments && data.activeEnrollments.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        Active Training
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.activeEnrollments.map((enrollment) => (
                            <Card key={enrollment.id} className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all group">
                                <CardContent className="p-0">
                                    <div className="flex gap-4 p-4">
                                        <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                                            {enrollment.thumbnail ? (
                                                <Image 
                                                    src={enrollment.thumbnail} 
                                                    alt={enrollment.title} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                    <BookOpen className="h-8 w-8 text-primary/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-secondary truncate mb-1 group-hover:text-primary transition-colors">
                                                {enrollment.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0 h-4">
                                                    {enrollment.status}
                                                </Badge>
                                                <Link 
                                                    href={`/portal/student/courses/${enrollment.courseId}`}
                                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                                                >
                                                    Continue <ArrowUpRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
