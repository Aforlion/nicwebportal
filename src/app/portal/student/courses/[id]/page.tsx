import { getCourseContent } from "@/actions/get-course-content"
import QuizPlayer from "@/components/student/quiz-player"
import CourseCompletionCard from "@/components/student/course-completion-card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, PlayCircle, ChevronLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { RichText } from "@/components/ui/rich-text"
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text"
import LessonCompleteButton from "@/components/student/lesson-complete-button"

export default async function LessonPlayerPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ lessonId?: string, type?: 'lesson' | 'module' | 'course', moduleId?: string }>
}) {
    const { id: courseId } = await params
    const { lessonId, type = 'lesson', moduleId } = await searchParams
    const data = await getCourseContent(courseId)

    if (!data) {
        redirect('/portal/student')
    }

    const { course, progress, overallProgress } = data

    // Sort modules and lessons
    const sortedModules = course.modules?.sort((a: any, b: any) => a.sort_order - b.sort_order)

    // Calculate progression locks
    const itemStates = new Map<string, { isLocked: boolean }>()
    itemStates.set(course.id, { isLocked: false })

    let previousItemCompleted = true // The course introduction is always accessible

    sortedModules.forEach((m: any) => {
        itemStates.set(m.id, { isLocked: !previousItemCompleted })

        m.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((l: any) => {
            const isCompleted = !!progress[l.id];
            itemStates.set(l.id, { isLocked: !previousItemCompleted })
            // For the next item in the sequence to be unlocked, this lesson MUST be completed
            previousItemCompleted = isCompleted
        })
    })

    // Determine active content
    let activeContent: any = null
    let activeType = type

    if (type === 'course') {
        activeContent = course
    } else if (type === 'module' && moduleId) {
        activeContent = sortedModules.find((m: any) => m.id === moduleId)
    } else {
        // Default to first lesson if no lessonId or if explicit lesson type
        const allLessons = sortedModules.flatMap((m: any) => m.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [])
        activeContent = lessonId
            ? allLessons.find((l: any) => l.id === lessonId)
            : allLessons[0]

        if (!activeContent && !lessonId) {
            // If no lessons, fall back to course intro
            activeType = 'course'
            activeContent = course
        } else {
            activeType = 'lesson'
        }
    }

    // Redirect to nearest unlocked content if user tries to access locked content
    const isActiveContentLocked = activeContent ? itemStates.get(activeContent.id)?.isLocked : false

    // Navigation logic
    const allItems: { id: string, type: string, moduleId?: string }[] = [
        { id: course.id, type: 'course' }
    ]

    sortedModules.forEach((m: any) => {
        allItems.push({ id: m.id, type: 'module' })
        m.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((l: any) => {
            allItems.push({ id: l.id, type: 'lesson', moduleId: m.id })
        })
    })

    const currentIndex = allItems.findIndex(item =>
        (activeType === 'lesson' && item.id === activeContent?.id) ||
        (activeType === 'module' && item.id === activeContent?.id) ||
        (activeType === 'course' && item.id === course.id)
    )

    const prevItem = allItems[currentIndex - 1]
    const nextItem = allItems[currentIndex + 1]
    const isNextItemLocked = nextItem ? itemStates.get(nextItem.id)?.isLocked : false

    const getHref = (item: any) => {
        if (!item) return '#'
        const params = new URLSearchParams()
        if (item.type === 'lesson') params.set('lessonId', item.id)
        params.set('type', item.type)
        if (item.type === 'module') params.set('moduleId', item.id)
        return `/portal/student/courses/${courseId}?${params.toString()}`
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row overflow-hidden -m-4 sm:-m-8">
            {/* Sidebar - Course Curriculum */}
            <div className="w-full lg:w-96 border-r bg-muted/5 flex flex-col h-full overflow-hidden shrink-0">
                <div className="p-5 border-b bg-background">
                    <Link href="/portal/student" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Link>
                    <h2 className="font-bold text-xl leading-tight text-secondary">{course.title}</h2>
                    <div className="mt-4 bg-muted/50 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${overallProgress || 0}%` }} />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mt-2 text-right">{Math.round(overallProgress || 0)}% Complete</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Course Intro Link */}
                    <Link
                        href={getHref({ id: course.id, type: 'course' })}
                        className={`w-full flex items-center gap-3 px-4 py-4 text-sm rounded-xl transition-all border
                            ${activeType === 'course' ? 'bg-primary/10 text-primary font-bold border-primary/20 shadow-sm' : 'hover:bg-muted text-secondary font-semibold border-transparent'}
                        `}
                    >
                        <div className={`p-2 rounded-lg ${activeType === 'course' ? 'bg-primary/20' : 'bg-muted'}`}>
                            <PlayCircle className={`h-5 w-5 ${activeType === 'course' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-60">Introduction</span>
                            <span>Course Overview</span>
                        </div>
                    </Link>

                    {sortedModules?.map((module: any, idx: number) => {
                        const isModuleLocked = itemStates.get(module.id)?.isLocked;
                        
                        return (
                        <div key={module.id} className="space-y-2">
                            <div className="px-2">
                                {isModuleLocked ? (
                                    <div className="w-full flex flex-col gap-1 p-3 rounded-xl border border-transparent opacity-50 cursor-not-allowed">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Module {idx + 1}</span>
                                            <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-bold line-clamp-1 text-muted-foreground">
                                            {module.title}
                                        </span>
                                    </div>
                                ) : (
                                    <Link
                                        href={getHref({ id: module.id, type: 'module' })}
                                        className={`group w-full flex flex-col gap-1 p-3 rounded-xl transition-all border
                                            ${activeType === 'module' && activeContent?.id === module.id ? 'bg-emerald-50 border-emerald-100' : 'hover:bg-muted/50 border-transparent'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Module {idx + 1}</span>
                                            <BookOpen className={`h-3 w-3 ${activeType === 'module' && activeContent?.id === module.id ? 'text-emerald-500' : 'text-muted-foreground opacity-30'}`} />
                                        </div>
                                        <span className={`text-sm font-bold line-clamp-1 ${activeType === 'module' && activeContent?.id === module.id ? 'text-emerald-900' : 'text-secondary group-hover:text-primary transition-colors'}`}>
                                            {module.title}
                                        </span>
                                    </Link>
                                )}
                            </div>

                            <div className="space-y-1 ml-4 border-l-2 border-muted/30">
                                {module.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((lesson: any) => {
                                    const isCompleted = progress[lesson.id]
                                    const isActive = activeType === 'lesson' && lesson.id === activeContent?.id
                                    const isLessonLocked = itemStates.get(lesson.id)?.isLocked;

                                    if (isLessonLocked) {
                                        return (
                                            <div key={lesson.id} className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-r-xl transition-all opacity-50 cursor-not-allowed">
                                                <div className="shrink-0">
                                                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <span className="line-clamp-1 text-muted-foreground">{lesson.title}</span>
                                            </div>
                                        )
                                    }

                                    return (
                                        <Link
                                            key={lesson.id}
                                            href={getHref({ id: lesson.id, type: 'lesson' })}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-r-xl transition-all
                                                ${isActive ? 'bg-primary/5 text-primary font-bold border-l-4 border-primary -ml-[2px]' : 'hover:bg-muted/30 text-muted-foreground hover:text-secondary'}
                                            `}
                                        >
                                            <div className="shrink-0">
                                                {isCompleted ? (
                                                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                    </div>
                                                ) : isActive ? (
                                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                    </div>
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground/20" />
                                                )}
                                            </div>
                                            <span className="line-clamp-1">{lesson.title}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-background flex flex-col">
                <div className="max-w-4xl mx-auto w-full p-6 lg:p-12">
                    {isActiveContentLocked ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-20 text-center bg-muted/5 rounded-3xl border border-dashed border-muted">
                            <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                                <svg className="h-10 w-10 opacity-40 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-secondary mb-3">Content Locked</h3>
                            <p className="max-w-md text-slate-500 font-medium leading-relaxed">Please complete the previous lessons earlier in the curriculum to unlock this piece of content.</p>
                            <Button variant="default" asChild className="mt-8 rounded-full px-8 shadow-sm">
                                <Link href={`/portal/student/courses/${courseId}`}>Go to Curriculum Start</Link>
                            </Button>
                        </div>
                    ) : activeType === 'lesson' && activeContent ? (
                        <>
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-10 relative group border-4 border-muted/10">
                                {activeContent.video_url ? (
                                    <iframe
                                        src={activeContent.video_url}
                                        className="w-full h-full"
                                        allowFullScreen
                                        title={activeContent.title}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-slate-900">
                                        <div className="text-center">
                                            <PlayCircle className="h-20 w-20 mx-auto mb-4 opacity-20" />
                                            <p className="font-medium tracking-wide">No video content for this lesson.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-muted/30 pb-8 mb-10">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black text-secondary tracking-tight">{activeContent.title}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                        <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold uppercase tracking-wider">Lesson</span>
                                        <span>•</span>
                                        <span>{sortedModules?.find((m: any) => m.lessons?.some((l: any) => l.id === activeContent.id))?.title}</span>
                                    </div>
                                </div>
                                {!activeContent.assessments && (
                                    <LessonCompleteButton
                                        courseId={course.id}
                                        lessonId={activeContent.id}
                                        isCompleted={!!progress[activeContent.id]}
                                    />
                                )}
                                {activeContent.assessments && !!progress[activeContent.id] && (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-bold shadow-sm">
                                        <CheckCircle className="h-5 w-5" />
                                        Completed
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-slate prose-lg max-w-none">
                                <RichText
                                    content={activeContent.content || "No additional text content for this lesson."}
                                    className="leading-relaxed text-slate-700"
                                />

                                {activeContent.resource_url && (
                                    <div className="mt-12 p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-between group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-red-500">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Lesson Resources</h4>
                                                <p className="text-sm text-slate-500">Download supplementary materials for this lesson</p>
                                            </div>
                                        </div>
                                        <Button asChild variant="outline" className="group-hover:bg-primary group-hover:text-white transition-all">
                                            <a href={activeContent.resource_url} target="_blank" rel="noopener noreferrer">Download PDF</a>
                                        </Button>
                                    </div>
                                )}

                                {/* Assessment / Quiz Section */}
                                {activeContent.assessments && !progress[activeContent.id] && (
                                    <div className="mt-16 pt-10 border-t-2 border-muted/30">
                                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">Assessment</div>
                                        <h2 className="text-2xl font-black mb-8 text-secondary">Knowledge Check</h2>
                                        <QuizPlayer
                                            courseId={course.id}
                                            lessonId={activeContent.id}
                                            assessment={activeContent.assessments}
                                        />
                                    </div>
                                )}
                                {activeContent.assessments && !!progress[activeContent.id] && (
                                    <div className="mt-16 pt-10 border-t-2 border-muted/30 p-10 bg-slate-50 rounded-2xl text-center border">
                                        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                                        <h2 className="text-2xl font-black text-secondary">Assessment Completed</h2>
                                        <p className="text-muted-foreground mt-2">You have successfully submitted your assessment for this module. You can now proceed to the next section.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (activeType === 'module' || activeType === 'course') && activeContent ? (
                        <div className="py-10">
                            <div className="mb-12">
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
                                    {activeType === 'course' ? 'Course Introduction' : 'Module Introduction'}
                                </div>
                                <h1 className="text-5xl font-black text-secondary tracking-tight mb-6">{activeContent.title}</h1>
                                {activeType === 'course' && (
                                    <div className="flex items-center gap-4 text-muted-foreground font-medium mb-8">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{sortedModules?.length} Modules</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <PlayCircle className="h-4 w-4" />
                                            <span>{sortedModules?.reduce((acc: any, m: any) => acc + (m.lessons?.length || 0), 0)} Lessons</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-slate prose-xl max-w-none bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                <RichText
                                    content={activeContent.description || "Welcome to this section. Get started by selecting the first lesson in the curriculum."}
                                    className="leading-loose text-slate-700"
                                />
                            </div>

                            {activeType === 'course' && (
                                <div className="mt-12">
                                    <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg font-bold shadow-xl shadow-primary/20 transition-transform active:scale-95">
                                        <Link href={getHref(allItems[1])}>Start Course</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-20 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                                <PlayCircle className="h-10 w-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary mb-2">Content Not Found</h3>
                            <p>The lesson or module you're looking for could not be found.</p>
                            <Button variant="link" asChild className="mt-4">
                                <Link href={`/portal/student/courses/${courseId}`}>Back to Introduction</Link>
                            </Button>
                        </div>
                    )}

                    {/* Navigation Bar at the bottom */}
                    <div className="mt-20 pt-10 border-t-2 border-muted/20 flex items-center justify-between pb-10">
                        {prevItem ? (
                            <Button variant="ghost" asChild className="group text-secondary font-bold h-auto py-3">
                                <Link href={getHref(prevItem)} className="flex items-center">
                                    <ChevronLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                                    <div className="text-left">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">Previous</div>
                                        <div className="line-clamp-1 max-w-[200px]">
                                            {prevItem.type === 'lesson' 
                                                ? sortedModules.flatMap((m: any) => m.lessons).find((l: any) => l.id === prevItem.id)?.title 
                                                : prevItem.type === 'module' 
                                                    ? `Module: ${sortedModules.find((m: any) => m.id === prevItem.id)?.title}`
                                                    : 'Course Overview'}
                                        </div>
                                    </div>
                                </Link>
                            </Button>
                        ) : <div />}

                        {nextItem ? (
                            isNextItemLocked ? (
                                <Button disabled className="group bg-muted text-muted-foreground font-bold h-16 px-8 rounded-2xl shadow-none cursor-not-allowed">
                                    <div className="flex items-center">
                                        <div className="text-right mr-4">
                                            <div className="text-[10px] uppercase tracking-widest leading-none mb-1">Next Up (Locked)</div>
                                            <div className="line-clamp-1 max-w-[250px]">
                                                {nextItem.type === 'lesson' 
                                                    ? sortedModules.flatMap((m: any) => m.lessons).find((l: any) => l.id === nextItem.id)?.title 
                                                    : nextItem.type === 'module'
                                                        ? `Next Module: ${sortedModules.find((m: any) => m.id === nextItem.id)?.title}`
                                                        : 'Complete Current Lesson'}
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </Button>
                            ) : (
                                <Button asChild className="group bg-secondary hover:bg-secondary/90 text-white font-bold h-16 px-8 rounded-2xl shadow-lg transition-all active:scale-95">
                                    <Link href={getHref(nextItem)} className="flex items-center">
                                        <div className="text-right mr-4">
                                            <div className="text-[10px] text-white/60 uppercase tracking-widest leading-none mb-1">Next Up</div>
                                            <div className="line-clamp-1 max-w-[250px]">
                                                {nextItem.type === 'lesson' 
                                                    ? sortedModules.flatMap((m: any) => m.lessons).find((l: any) => l.id === nextItem.id)?.title 
                                                    : nextItem.type === 'module'
                                                        ? `Next Module: ${sortedModules.find((m: any) => m.id === nextItem.id)?.title}`
                                                        : 'Continue Learning'}
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                            <svg className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </Link>
                                </Button>
                            )
                        ) : (
                            overallProgress === 100 && (
                                <CourseCompletionCard courseId={course.id} />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
