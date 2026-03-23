import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, Award, ArrowRight, ShieldCheck, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getStudentDashboardData } from "@/actions/get-student-progress"
import { CPDProgress } from "@/components/student/cpd-progress"
import { CertificationPathway } from "@/components/student/certification-pathway"

import { ErrorBoundary } from "@/components/error-boundary"

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
    const { enrollments, recent, events, tip, cpdCredits, currentLevel } = await getStudentDashboardData()

    return (
        <ErrorBoundary>
            <div className="space-y-8 relative overflow-hidden">
                {/* Decorative Background Coat of Arms */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none -translate-y-12 translate-x-12">
                    <Image src="/coat-of-arm.png" alt="" width={300} height={300} />
                </div>

                {/* Welcome Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block p-2 bg-white rounded-xl border shadow-sm">
                            <Image src="/coat-of-arm.png" alt="COA" width={48} height={48} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-secondary">Welcome back!</h1>
                            <p className="text-muted-foreground">
                                You have {enrollments.filter((e: any) => e.status === 'active' || e.status === 'enrolled').length} courses in progress.
                            </p>
                        </div>
                    </div>
                    {recent && (
                        <Button className="bg-primary" asChild>
                            <Link href={`/portal/student/courses/${(Array.isArray(recent.course) ? recent.course[0] : recent.course)?.id}`}>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Continue Learning
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats Overview */}
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        {
                            title: "Enrolled Courses",
                            value: enrollments.length.toString(),
                            icon: BookOpen,
                            color: "text-blue-600",
                            bg: "bg-blue-50"
                        },
                        {
                            title: "Completion Rate",
                            value: `${Math.round(enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / (enrollments.length || 1))}%`,
                            icon: Clock,
                            color: "text-primary",
                            bg: "bg-primary/10"
                        },
                        {
                            title: "Certificates",
                            value: enrollments.filter((e: any) => e.status === 'completed').length.toString(),
                            icon: Award,
                            color: "text-accent",
                            bg: "bg-accent/10"
                        },
                    ].map((stat) => (
                        <Card key={stat.title}>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className={`${stat.bg} flex h-12 w-12 items-center justify-center rounded-xl`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <div className="text-2xl font-bold text-secondary">{stat.value}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Course Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-secondary">Current Courses</h2>
                            <Link href="/programs" className="text-sm font-medium text-primary hover:underline flex items-center">
                                Browse Catalog <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>

                        <div className="grid gap-6">
                            {enrollments.length === 0 ? (
                                <Card className="p-8 text-center bg-muted/20 border-dashed">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-semibold text-secondary">No courses yet</h3>
                                    <p className="text-muted-foreground mb-4">Start your learning journey today.</p>
                                    <Button variant="outline" asChild>
                                        <Link href="/programs">Browse Courses</Link>
                                    </Button>
                                </Card>
                            ) : (
                                enrollments.map((enrollment: any) => (
                                    <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="sm:w-48 bg-muted/30 p-6 flex items-center justify-center relative">
                                                    {enrollment.course?.thumbnail_url ? (
                                                        <img src={enrollment.course.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                                    ) : (
                                                        <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                                <div className="flex-grow p-6">
                                                    <div className="mb-4 flex items-start justify-between">
                                                        <div>
                                                            <Badge
                                                                variant={enrollment.status === 'completed' ? 'success' : 'info'}
                                                                className="mb-2"
                                                            >
                                                                {enrollment.status === 'active' || enrollment.status === 'enrolled' ? 'In Progress' : enrollment.status}
                                                            </Badge>
                                                            <h3 className="text-lg font-bold text-secondary line-clamp-1">{enrollment.course?.title}</h3>
                                                            <p className="text-sm text-muted-foreground">{enrollment.course?.level || "Certification"}</p>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="shrink-0" asChild>
                                                            <Link href={`/portal/student/courses/${enrollment.course?.id}`}>
                                                                <ArrowRight className="h-5 w-5" />
                                                            </Link>
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium text-secondary">{enrollment.progress || 0}% Complete</span>
                                                        </div>
                                                        <Progress value={enrollment.progress || 0} className="h-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar content for Dashboard */}
                    <div className="space-y-6">
                        <CPDProgress currentCredits={cpdCredits || 0} level={currentLevel || 1} />
                        
                        <CertificationPathway currentLevel={currentLevel || 1} />

                        <h2 className="text-xl font-bold text-secondary">Upcoming</h2>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Training Calendar</CardTitle>
                                <CardDescription>Scheduled live sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {events && events.length > 0 ? (
                                    events.map((event: any) => {
                                        const date = new Date(event.published_at)
                                        const month = date.toLocaleString('default', { month: 'short' })
                                        const day = date.getDate()
                                        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                                        return (
                                            <div key={event.id} className="flex gap-4 items-start border-b border-muted pb-4 last:border-0 last:pb-0">
                                                <div className="bg-primary/5 rounded px-2 py-1 text-center min-w-[50px]">
                                                    <p className="text-xs font-bold text-primary">{month}</p>
                                                    <p className="text-lg font-bold text-primary leading-none">{day}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-secondary leading-tight">{event.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {time} • <Badge variant="outline" className="text-[10px] h-4 py-0 leading-none">{event.type.toUpperCase()}</Badge>
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground text-xs italic">
                                        No upcoming live sessions.
                                    </div>
                                )}
                                <Button variant="outline" className="w-full text-xs h-8" asChild>
                                    <Link href="/portal/student/internship">View Full Calendar</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-accent/5 border-accent/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-accent" />
                                    Certification Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {tip}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
