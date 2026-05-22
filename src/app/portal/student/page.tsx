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
import { getPublishedCourses } from "@/actions/get-courses"
import { Suspense } from "react"

export const dynamic = 'force-dynamic'

async function RecommendedCourses() {
    const courses = await getPublishedCourses()
    // Show top 2-4 published courses
    const recommended = courses.slice(0, 4)

    if (recommended.length === 0) return null;

    return (
        <>
            {recommended.map((course: any) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all flex flex-col h-full border-muted">
                    <div className="aspect-video w-full bg-slate-100 relative">
                        {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                                <BookOpen size={24} />
                            </div>
                        )}
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                        <Badge variant="secondary" className="w-fit mb-2 text-[10px]">{course.level || "Course"}</Badge>
                        <h4 className="font-bold text-sm text-secondary line-clamp-2 mb-2 flex-grow">{course.title}</h4>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t text-xs">
                            <span className="font-semibold text-primary">{course.price > 0 ? `₦${course.price.toLocaleString()}` : "Free"}</span>
                            <Link href={`/programs/${course.slug}`} className="text-muted-foreground hover:text-primary flex items-center">
                                Details <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    )
}

export default async function StudentDashboard() {
    const { enrollments, recent, events, tip, cpdCredits, currentLevel } = await getStudentDashboardData()

    return (
        <ErrorBoundary>
            <div className="space-y-8 relative min-h-[calc(100vh-100px)]">
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                    <Image 
                        src="/coat-of-arm.png" 
                        alt="" 
                        width={600} 
                        height={600} 
                        className="object-contain"
                    />
                </div>

                <div className="relative z-10">

                {/* Welcome Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block p-2 bg-white rounded-xl border shadow-sm">
                            <Image src="/logo.jpg" alt="NIC" width={48} height={48} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-secondary">Welcome back!</h1>
                            <p className="text-muted-foreground">
                                You have {(enrollments || []).filter((e: any) => e?.status === 'active' || e?.status === 'enrolled').length} courses in progress.
                            </p>
                        </div>
                    </div>
                    {recent && (Array.isArray(recent.course) ? recent.course[0] : recent.course)?.id && (
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
                            value: (enrollments || []).length.toString(),
                            icon: BookOpen,
                            color: "text-blue-600",
                            bg: "bg-blue-50"
                        },
                        {
                            title: "Completion Rate",
                            value: `${Math.round((enrollments || []).reduce((acc: number, curr: any) => acc + (curr?.progress || 0), 0) / (enrollments?.length || 1))}%`,
                            icon: Clock,
                            color: "text-primary",
                            bg: "bg-primary/10"
                        },
                        {
                            title: "Certificates",
                            value: (enrollments || []).filter((e: any) => e?.status === 'completed').length.toString(),
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
                            {(enrollments || []).length === 0 ? (
                                <div className="space-y-6">
                                    <Card className="p-8 text-center bg-primary/5 border-dashed border-primary/20">
                                        <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 opacity-70" />
                                        <h3 className="text-lg font-semibold text-secondary">Your Learning Journey Starts Here</h3>
                                        <p className="text-muted-foreground mb-6">As a registered Student Member, you are required to enroll in an orientation or foundational course.</p>
                                        <Button className="bg-primary" asChild>
                                            <Link href="/programs">Browse All Courses</Link>
                                        </Button>
                                    </Card>

                                    <div className="pt-4">
                                        <h3 className="text-lg font-bold text-secondary mb-4">Recommended Courses</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg col-span-2"></div>}>
                                                <RecommendedCourses />
                                            </Suspense>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                enrollments.map((enrollment: any, index: number) => {
                                    const course = Array.isArray(enrollment?.course) ? enrollment.course[0] : enrollment?.course;
                                    return (
                                    <Card key={enrollment?.id || index} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="sm:w-48 bg-muted/30 p-6 flex items-center justify-center relative">
                                                    {course?.thumbnail_url ? (
                                                        <img src={course.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                                    ) : (
                                                        <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                                <div className="flex-grow p-6">
                                                    <div className="mb-4 flex items-start justify-between">
                                                        <div>
                                                            <Badge
                                                                variant={enrollment?.status === 'completed' ? 'success' : 'info'}
                                                                className="mb-2"
                                                            >
                                                                {enrollment?.status === 'active' || enrollment?.status === 'enrolled' ? 'In Progress' : (enrollment?.status || 'Unknown')}
                                                            </Badge>
                                                            <h3 className="text-lg font-bold text-secondary line-clamp-1">{course?.title || "Untitled Course"}</h3>
                                                            <p className="text-sm text-muted-foreground">{course?.level || "Certification"}</p>
                                                        </div>
                                                        {course?.id && (
                                                            <Button variant="ghost" size="icon" className="shrink-0" asChild>
                                                                <Link href={`/portal/student/courses/${course.id}`}>
                                                                    <ArrowRight className="h-5 w-5" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium text-secondary">{enrollment?.progress || 0}% Complete</span>
                                                        </div>
                                                        <Progress value={enrollment?.progress || 0} className="h-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )})
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
                                    events.map((event: any, idx: number) => {
                                        const date = new Date(event?.published_at || new Date())
                                        const month = date.toLocaleString('default', { month: 'short' })
                                        const day = date.getDate()
                                        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                                        return (
                                            <div key={event?.id || idx} className="flex gap-4 items-start border-b border-muted pb-4 last:border-0 last:pb-0">
                                                <div className="bg-primary/5 rounded px-2 py-1 text-center min-w-[50px]">
                                                    <p className="text-xs font-bold text-primary">{month}</p>
                                                    <p className="text-lg font-bold text-primary leading-none">{day}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-secondary leading-tight">{event?.title || "Upcoming Event"}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {time} {event?.type && `• `} <Badge variant="outline" className="text-[10px] h-4 py-0 leading-none">{event?.type?.toUpperCase() || ''}</Badge>
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
        </div>
        </ErrorBoundary>
    )
}
