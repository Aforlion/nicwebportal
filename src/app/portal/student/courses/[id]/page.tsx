import { getCourseContent } from "@/actions/get-course-content"
import QuizPlayer from "@/components/student/quiz-player"
import CourseCompletionCard from "@/components/student/course-completion-card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, PlayCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LessonPlayerPage({ params }: { params: { id: string } }) {
    const data = await getCourseContent(params.id)

    if (!data) {
        redirect('/portal/student')
    }

    const { course, progress, overallProgress } = data

    // Determine current lesson (first uncompleted or first overall)
    // For MVP, we just default to the first lesson of the first module if no state management logic yet
    //Ideally this would be dynamic based on query params ?lesson=slug

    // Sort modules and lessons
    const sortedModules = course.modules?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    const firstLesson = sortedModules?.[0]?.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0]

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row overflow-hidden -m-4 sm:-m-8">
            {/* Sidebar - Course Curriculum */}
            <div className="w-full lg:w-80 border-r bg-muted/10 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b bg-background">
                    <Link href="/portal/student" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-3">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Link>
                    <h2 className="font-bold text-lg leading-tight line-clamp-2">{course.title}</h2>
                    <div className="mt-3 bg-muted/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-green-500 h-full transition-all" style={{ width: `${overallProgress || 0}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(overallProgress || 0)}% Complete</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {sortedModules?.map((module: any, idx: number) => (
                        <div key={module.id}>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                                Module {idx + 1}: {module.title}
                            </h3>
                            <div className="space-y-1">
                                {module.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((lesson: any) => {
                                    const isCompleted = progress[lesson.id]
                                    // For MVP preview, assume first lesson is active if no params
                                    const isActive = lesson.id === firstLesson?.id

                                    return (
                                        <button
                                            key={lesson.id}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left
                                                ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}
                                            `}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                            ) : isActive ? (
                                                <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                                            )}
                                            <span className="line-clamp-1">{lesson.title}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Video Player */}
            <div className="flex-1 overflow-y-auto bg-background flex flex-col">
                {firstLesson ? (
                    <div className="max-w-4xl mx-auto w-full p-6 lg:p-10">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-8 relative group">
                            {firstLesson.video_url ? (
                                <iframe
                                    src={firstLesson.video_url}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title={firstLesson.title}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-slate-900">
                                    <div className="text-center">
                                        <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p>No video content for this lesson.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start justify-between border-b pb-6 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-secondary mb-2">{firstLesson.title}</h1>
                                <p className="text-muted-foreground">Module: {sortedModules?.find((m: any) => m.lessons?.some((l: any) => l.id === firstLesson.id))?.title}</p>
                            </div>
                            <Button size="lg" className="gap-2">
                                Mark as Complete <CheckCircle className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="prose max-w-none text-muted-foreground pb-20">
                            {/* Markdown content would go here */}
                            <p className="text-lg leading-relaxed">
                                {firstLesson.content || "No additional text content for this lesson."}
                            </p>

                            {/* Assessment / Quiz Section */}
                            {firstLesson.assessments && (
                                <div className="mt-12 pt-8 border-t">
                                    <h2 className="text-2xl font-bold mb-6">Lesson Assessment</h2>
                                    <QuizPlayer
                                        courseId={course.id}
                                        lessonId={firstLesson.id}
                                        assessment={firstLesson.assessments}
                                    />
                                </div>
                            )}

                            {/* Course Completion Section */}
                            {Math.round(overallProgress || 0) === 100 && (
                                <div className="mt-12 pt-8 border-t">
                                    <CourseCompletionCard courseId={course.id} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a lesson to start learning
                    </div>
                )}
            </div>
        </div>
    )
}
