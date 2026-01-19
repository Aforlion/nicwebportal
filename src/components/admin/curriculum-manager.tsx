'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import {
    GripVertical,
    Plus,
    Trash2,
    Video,
    FileText,
    MoreVertical,
    Edit,
    Loader2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    createModule,
    deleteModule,
    createLesson,
    deleteLesson,
    updateLesson
} from "@/actions/admin/manage-curriculum"

interface CurriculumManagerProps {
    course: any
}

export function CurriculumManager({ course }: CurriculumManagerProps) {
    const router = useRouter()
    const [isCreatingModule, setIsCreatingModule] = useState(false)
    const [isCreatingLesson, setIsCreatingLesson] = useState<string | null>(null) // module ID
    const [isEditingLesson, setIsEditingLesson] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleAddModule(formData: FormData) {
        setIsLoading(true)
        await createModule(course.id, formData)
        setIsLoading(false)
        setIsCreatingModule(false)
        router.refresh()
    }

    async function handleAddLesson(moduleId: string, formData: FormData) {
        setIsLoading(true)
        await createLesson(course.id, moduleId, formData)
        setIsLoading(false)
        setIsCreatingLesson(null)
        router.refresh()
    }

    async function handleUpdateLesson(formData: FormData) {
        if (!isEditingLesson) return
        setIsLoading(true)
        await updateLesson(course.id, isEditingLesson.id, formData)
        setIsLoading(false)
        setIsEditingLesson(null)
        router.refresh()
    }

    async function handleDeleteModule(moduleId: string) {
        if (!confirm("Are you sure? This will delete all lessons in this module.")) return
        setIsLoading(true)
        await deleteModule(course.id, moduleId)
        setIsLoading(false)
        router.refresh()
    }

    async function handleDeleteLesson(lessonId: string) {
        if (!confirm("Are you sure you want to delete this lesson?")) return
        setIsLoading(true)
        await deleteLesson(course.id, lessonId)
        setIsLoading(false)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Course Curriculum</h2>
                <Button onClick={() => setIsCreatingModule(true)} disabled={isCreatingModule}>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
            </div>

            {isCreatingModule && (
                <form action={handleAddModule} className="bg-muted/30 p-4 rounded-lg border flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <Input
                        name="title"
                        placeholder="Module Title (e.g. Introduction to Caregiving)"
                        className="flex-1 bg-background"
                        autoFocus
                        required
                    />
                    <Button type="submit" disabled={isLoading}>Add</Button>
                    <Button type="button" variant="ghost" onClick={() => setIsCreatingModule(false)}>Cancel</Button>
                </form>
            )}

            <div className="space-y-4">
                {(course.modules || []).map((module: any, index: number) => (
                    <div key={module.id} className="border rounded-lg bg-card overflow-hidden">
                        <div className="flex items-center gap-3 p-4 bg-muted/40 border-b">
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                            <div className="flex-1 font-medium">
                                <span className="text-muted-foreground mr-2">Module {index + 1}:</span>
                                {module.title}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => setIsCreatingLesson(module.id)}>
                                    <Plus className="h-4 w-4 mr-1" /> Lesson
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteModule(module.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Module
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="p-2 space-y-2 bg-background/50">
                            {(module.lessons || []).map((lesson: any) => (
                                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-md border bg-background hover:bg-accent/5 transition-colors group">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                                    {lesson.video_url ? (
                                        <Video className="h-4 w-4 text-primary" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                                    {lesson.is_preview && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Preview</span>}

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" asChild title="Manage Quiz">
                                            <a href={`/admin/training/${course.id}/lessons/${lesson.id}/assessment`}>
                                                <FileText className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => setIsEditingLesson(lesson)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {isCreatingLesson === module.id && (
                                <form
                                    action={(formData) => handleAddLesson(module.id, formData)}
                                    className="flex items-center gap-2 p-2 pl-10 animate-in fade-in"
                                >
                                    <Input
                                        name="title"
                                        placeholder="Lesson Title"
                                        className="h-9"
                                        autoFocus
                                        required
                                    />
                                    <Button size="sm" type="submit" disabled={isLoading}>Add</Button>
                                    <Button size="sm" variant="ghost" type="button" onClick={() => setIsCreatingLesson(null)}>Cancel</Button>
                                </form>
                            )}

                            {(!module.lessons || module.lessons.length === 0) && !isCreatingLesson && (
                                <div className="text-center py-4 text-sm text-muted-foreground italic">
                                    No lessons in this module yet.
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {(!course.modules || course.modules.length === 0) && !isCreatingModule && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">Start building your course by adding a module.</p>
                        <Button onClick={() => setIsCreatingModule(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add First Module
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit Lesson Dialog */}
            <Dialog open={!!isEditingLesson} onOpenChange={(open) => !open && setIsEditingLesson(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Lesson</DialogTitle>
                    </DialogHeader>
                    {isEditingLesson && (
                        <form action={handleUpdateLesson} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Lesson Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={isEditingLesson.title}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="duration_minutes">Duration (Minutes)</Label>
                                    <Input
                                        id="duration_minutes"
                                        name="duration_minutes"
                                        type="number"
                                        defaultValue={isEditingLesson.duration_minutes}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="video_url">Video Embed URL</Label>
                                    <Input
                                        id="video_url"
                                        name="video_url"
                                        placeholder="https://www.youtube.com/embed/..."
                                        defaultValue={isEditingLesson.video_url}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="content">Lesson Content / Notes (Markdown)</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    className="min-h-[150px]"
                                    defaultValue={isEditingLesson.content}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_preview"
                                    name="is_preview"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    defaultChecked={isEditingLesson.is_preview}
                                />
                                <Label htmlFor="is_preview" className="font-normal cursor-pointer">
                                    Available as Free Preview
                                </Label>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditingLesson(null)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
