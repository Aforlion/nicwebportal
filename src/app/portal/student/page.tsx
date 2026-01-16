import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, Award, ArrowRight, ShieldCheck, BookOpen } from "lucide-react"
import Link from "next/link"

const enrolledCourses = [
    {
        id: "hca-01",
        title: "Healthcare Assistant (HCA) - Foundation",
        instructor: "Dr. Sarah Ahmed",
        progress: 65,
        nextLesson: "Module 4: Infection Control",
        status: "Active",
    },
    {
        id: "dementia-02",
        title: "Dementia Care Specialist",
        instructor: "Prof. Benson Ibe",
        progress: 20,
        nextLesson: "Module 2: Cognitive Psychology",
        status: "In Progress",
    },
]

export default function StudentDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Welcome back, John!</h1>
                    <p className="text-muted-foreground">You have 2 courses in progress and 1 upcoming assignment.</p>
                </div>
                <Button className="bg-primary" asChild>
                    <Link href="/portal/student/courses">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue Learning
                    </Link>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: "Completed Modules", value: "14", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
                    { title: "Learning Hours", value: "48h", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
                    { title: "CPD Points", value: "125", icon: Award, color: "text-accent", bg: "bg-accent/10" },
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
                        <Link href="/portal/student/courses" className="text-sm font-medium text-primary hover:underline flex items-center">
                            View All <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>

                    <div className="grid gap-6">
                        {enrolledCourses.map((course) => (
                            <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-48 bg-muted/30 p-6 flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                                        </div>
                                        <div className="flex-grow p-6">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <Badge className="mb-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                        {course.status}
                                                    </Badge>
                                                    <h3 className="text-lg font-bold text-secondary line-clamp-1">{course.title}</h3>
                                                    <p className="text-sm text-muted-foreground">Instructor: {course.instructor}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                                                    <Link href={`/portal/student/courses/${course.id}`}>
                                                        <ArrowRight className="h-5 w-5" />
                                                    </Link>
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-secondary">{course.progress}% Complete</span>
                                                    <span className="text-muted-foreground">3 modules left</span>
                                                </div>
                                                <Progress value={course.progress} className="h-2" />
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                                <PlayCircle className="h-3 w-3" />
                                                Next: {course.nextLesson}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar content for Dashboard */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-secondary">Upcoming</h2>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Training Calendar</CardTitle>
                            <CardDescription>Scheduled live sessions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { date: "Jan 20", time: "10:00 AM", title: "Infection Control Live Lab", type: "Lab" },
                                { date: "Jan 22", time: "02:00 PM", title: "Dementia Ethics Seminar", type: "Seminar" },
                            ].map((event) => (
                                <div key={event.title} className="flex gap-4 items-start border-b border-muted pb-4 last:border-0 last:pb-0">
                                    <div className="bg-primary/5 rounded px-2 py-1 text-center min-w-[50px]">
                                        <p className="text-xs font-bold text-primary">{event.date.split(' ')[0]}</p>
                                        <p className="text-lg font-bold text-primary leading-none">{event.date.split(' ')[1]}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-secondary leading-tight">{event.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {event.time} • <Badge variant="outline" className="text-[10px] h-4 py-0 leading-none">{event.type}</Badge>
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                                Complete your **HCA modules** and log your **internship hours** to become eligible for the National Registry.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
