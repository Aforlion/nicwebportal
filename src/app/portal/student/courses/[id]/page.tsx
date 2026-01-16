"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    CheckCircle2,
    Circle,
    PlayCircle,
    FileText,
    ChevronRight,
    Menu,
    Download,
    MessageSquare
} from "lucide-react"
import Link from "next/link"

const courseData = {
    title: "Healthcare Assistant (HCA) - Foundation",
    modules: [
        {
            title: "Module 1: Introduction to Professional Care",
            lessons: [
                { id: "1-1", title: "Role of the Healthcare Assistant", type: "video", completed: true, duration: "12:00" },
                { id: "1-2", title: "Ethics and Professionalism", type: "video", completed: true, duration: "15:30" },
                { id: "1-3", title: "Ethics Handbook (Reading)", type: "document", completed: true, duration: "10 mins" },
            ]
        },
        {
            title: "Module 2: Basic Human Anatomy",
            lessons: [
                { id: "2-1", title: "Organ Systems Overview", type: "video", completed: true, duration: "20:00" },
                { id: "2-2", title: "Common Health Conditions", type: "video", completed: false, duration: "18:45" },
                { id: "2-3", title: "Anatomy Quiz", type: "quiz", completed: false, duration: "15 mins" },
            ]
        },
        {
            title: "Module 3: Hygiene and Safety",
            lessons: [
                { id: "3-1", title: "Handwashing and Personal Protection", type: "video", completed: false, duration: "10:30" },
                { id: "3-2", title: "Waste Management Protocols", type: "video", completed: false, duration: "12:00" },
            ]
        }
    ]
}

export default function LessonViewerPage() {
    const [currentLesson, setCurrentLesson] = useState(courseData.modules[1].lessons[1])
    const [showSidebar, setShowSidebar] = useState(true)

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-theme(spacing.16))] bg-background">
            {/* Content Area */}
            <div className="flex-grow overflow-y-auto">
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/portal/student/courses" className="hover:text-primary">Courses</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="line-clamp-1">{courseData.title}</span>
                    </nav>

                    {/* Video Player Placeholder */}
                    <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center relative group">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all cursor-pointer">
                            <PlayCircle className="h-20 w-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <p className="text-lg font-bold">{currentLesson.title}</p>
                            <p className="text-xs opacity-80">Module 2 • Lesson 2</p>
                        </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">{currentLesson.title}</h1>
                            <p className="text-muted-foreground">Published on Jan 12, 2026 • {currentLesson.duration}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Materials
                            </Button>
                            <Button className="bg-primary" size="sm">
                                Mark as Complete
                            </Button>
                        </div>
                    </div>

                    {/* Discussion / Notes */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold text-secondary">Lesson Notes</h2>
                            <div className="prose prose-slate max-w-none text-muted-foreground">
                                <p>In this lesson, we cover the most common health conditions encountered by caregivers in a home-care setting. Focus is placed on:</p>
                                <ul>
                                    <li>Hypertension and medication management</li>
                                    <li>Arthritis and mobility support</li>
                                    <li>Diabetes and blood sugar monitoring (Introduction)</li>
                                </ul>
                                <p>Caregivers must be able to recognize early warning signs of complications for each of these conditions.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-secondary">Community Help</h2>
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">SM</div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold text-secondary">Samuel Musa</p>
                                            <p className="text-xs text-muted-foreground italic">Does this module include emergency response?</p>
                                        </div>
                                    </div>
                                    <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                                        <MessageSquare className="mr-2 h-3 w-3" />
                                        Ask a Question
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Sidebar */}
            {showSidebar && (
                <aside className="w-full lg:w-96 border-l bg-slate-50 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-secondary text-lg">Course Content</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="lg:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>COURSE PROGRESS</span>
                                <span>45%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                        </div>

                        <div className="space-y-6">
                            {courseData.modules.map((module, mIdx) => (
                                <div key={mIdx} className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        {module.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {module.lessons.map((lesson) => {
                                            const isCurrent = currentLesson.id === lesson.id
                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setCurrentLesson(lesson)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isCurrent
                                                            ? "bg-white border shadow-sm"
                                                            : "hover:bg-slate-200/50"
                                                        }`}
                                                >
                                                    {lesson.completed ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle className={`h-5 w-5 shrink-0 ${isCurrent ? "text-primary" : "text-slate-300"}`} />
                                                    )}
                                                    <div className="flex-grow min-w-0">
                                                        <p className={`text-sm font-medium line-clamp-2 ${isCurrent ? "text-primary" : "text-secondary"}`}>
                                                            {lesson.title}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            {lesson.type === 'video' ? <PlayCircle className="h-3 w-3 text-muted-foreground" /> : <FileText className="h-3 w-3 text-muted-foreground" />}
                                                            <span className="text-[10px] font-bold text-muted-foreground">{lesson.duration}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            )}
        </div>
    )
}
