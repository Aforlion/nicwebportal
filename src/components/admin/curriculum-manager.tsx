'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    GripVertical,
    Plus,
    Trash2,
    Video,
    FileText,
    MoreVertical,
    Edit,
    Loader2,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileUpload } from "@/components/ui/file-upload"
import { MarkdownHint } from "@/components/ui/markdown-hint"
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
    removeModuleFromCourse,
    linkModuleToCourse,
    getAvailableModules,
    createLesson,
    deleteLesson,
    updateLesson,
    updateModule,
    updateLessonOrder
} from "@/actions/admin/manage-curriculum"

interface CurriculumManagerProps {
    course: any
}

export function CurriculumManager({ course }: CurriculumManagerProps) {
    const router = useRouter()
    const [isCreatingModule, setIsCreatingModule] = useState(false)
    const [isLibraryOpen, setIsLibraryOpen] = useState(false)
    const [availableModules, setAvailableModules] = useState<any[]>([])
    const [isCreatingLesson, setIsCreatingLesson] = useState<string | null>(null) // module ID
    const [isEditingLesson, setIsEditingLesson] = useState<any | null>(null)
    const [isEditingModule, setIsEditingModule] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))
    }

    async function handleOpenLibrary() {
        setIsLoading(true)
        const result = await getAvailableModules()
        if (result.modules) {
            // Filter out modules already in the course
            const existingIds = (course.modules || []).map((m: any) => m.id)
            setAvailableModules(result.modules.filter((m: any) => !existingIds.includes(m.id)))
        }
        setIsLoading(false)
        setIsLibraryOpen(true)
    }

    async function handleLinkModule(moduleId: string) {
        setIsLoading(true)
        const result = await linkModuleToCourse(course.id, moduleId)
        if (result.success) {
            toast.success("Module added to course")
            router.refresh()
            setIsLibraryOpen(false)
        } else {
            toast.error(result.error || "Failed to add module")
        }
        setIsLoading(false)
    }

    async function handleAddModule(formData: FormData) {
        setIsLoading(true)
        const result = await createModule(course.id, formData)
        if (result.success) {
            toast.success("Module created and added to course")
            setIsCreatingModule(false)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to create module")
        }
        setIsLoading(false)
    }

    async function handleAddLesson(moduleId: string, formData: FormData) {
        setIsLoading(true)
        const result = await createLesson(course.id, moduleId, formData)
        if (result.success) {
            toast.success("Lesson created successfully")
            setIsCreatingLesson(null)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to create lesson")
        }
        setIsLoading(false)
    }

    async function handleUpdateLesson(formData: FormData) {
        if (!isEditingLesson) return
        setIsLoading(true)
        const result = await updateLesson(course.id, isEditingLesson.id, formData)
        if (result.success) {
            toast.success("Lesson updated")
            setIsEditingLesson(null)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to update lesson")
        }
        setIsLoading(false)
    }

    async function handleRemoveModule(moduleId: string) {
        if (!confirm("Remove this module from this course? (The module will stay in your library)")) return
        setIsLoading(true)
        const result = await removeModuleFromCourse(course.id, moduleId)
        if (result.success) {
            toast.success("Module removed from course")
            router.refresh()
        } else {
            toast.error(result.error || "Failed to remove module")
        }
        setIsLoading(false)
    }

    async function handleUpdateModule(formData: FormData) {
        if (!isEditingModule) return
        setIsLoading(true)
        const result = await updateModule(course.id, isEditingModule.id, formData)
        if (result.success) {
            toast.success("Module updated")
            setIsEditingModule(null)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to update module")
        }
        setIsLoading(false)
    }

    async function handleDeleteLesson(lessonId: string) {
        if (!confirm("Are you sure you want to delete this lesson?")) return
        setIsLoading(true)
        const result = await deleteLesson(course.id, lessonId)
        if (result.success) {
            toast.success("Lesson deleted")
            router.refresh()
        } else {
            toast.error(result.error || "Failed to delete lesson")
        }
        setIsLoading(false)
    }

    async function handleReorderLessons(moduleId: string, lessonIds: string[]) {
        setIsLoading(true)
        const result = await updateLessonOrder(course.id, moduleId, lessonIds)
        if (!result.success) {
            toast.error(result.error || "Failed to update lesson order")
            router.refresh()
        }
        setIsLoading(false)
    }

    function onDragEnd(event: DragEndEvent, moduleId: string, lessons: any[]) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = lessons.findIndex((item) => item.id === active.id)
            const newIndex = lessons.findIndex((item) => item.id === over.id)

            const newLessons = arrayMove(lessons, oldIndex, newIndex)
            const newLessonIds = newLessons.map((l: any) => l.id)

            handleReorderLessons(moduleId, newLessonIds)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Course Curriculum</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleOpenLibrary}>
                        <FileText className="mr-2 h-4 w-4" /> Add from Library
                    </Button>
                    <Button onClick={() => setIsCreatingModule(true)} disabled={isCreatingModule}>
                        <Plus className="mr-2 h-4 w-4" /> Create Module
                    </Button>
                </div>
            </div>

            {isCreatingModule && (
                <form action={handleAddModule} className="bg-muted/30 p-4 rounded-lg border flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                    <Input
                        name="title"
                        placeholder="Module Title (e.g. Introduction to Caregiving)"
                        className="bg-background"
                        autoFocus
                        required
                    />
                    <Textarea
                        name="description"
                        placeholder="Short overview of this module..."
                        className="bg-background min-h-[80px]"
                    />
                    <div className="grid gap-2">
                        <Label>Completion Requirement Info (Shown at start)</Label>
                        <Input
                            name="completion_requirements"
                            placeholder="e.g. Complete all lessons and achieve 70% in the assessment."
                            className="bg-background"
                        />
                    </div>
                    <MarkdownHint />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsCreatingModule(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>Create Module</Button>
                    </div>
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
                                        <DropdownMenuItem onClick={() => setIsEditingModule(module)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Module
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRemoveModule(module.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Remove from Course
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={async () => {
                                            if (confirm("Permanently DELETE this module from the library? This will affect ALL courses using it.")) {
                                                const result = await deleteModule(module.id)
                                                if (result.success) {
                                                    toast.success("Module deleted permanently")
                                                    router.refresh()
                                                } else {
                                                    toast.error(result.error || "Failed to delete module")
                                                }
                                            }
                                        }}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {module.completion_requirements && (
                            <div className="px-4 py-2 bg-blue-50/50 border-b text-sm">
                                <span className="font-bold text-blue-700 mr-2">Requirement:</span>
                                <span className="text-blue-600">{module.completion_requirements}</span>
                            </div>
                        )}

                        <div className="p-2 space-y-2 bg-background/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between text-muted-foreground hover:text-foreground"
                                onClick={() => toggleModule(module.id)}
                            >
                                <span className="text-xs font-semibold">{module.lessons?.length || 0} Lessons</span>
                                {expandedModules[module.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            {expandedModules[module.id] && (
                                <div className="space-y-2 pt-1 animate-in slide-in-from-top-1 duration-200">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={(event) => onDragEnd(event, module.id, module.lessons || [])}
                                    >
                                        <SortableContext
                                            items={(module.lessons || []).map((l: any) => l.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {(module.lessons || []).map((lesson: any) => (
                                                <SortableLessonItem
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    courseId={course.id}
                                                    onEdit={() => setIsEditingLesson(lesson)}
                                                    onDelete={() => handleDeleteLesson(lesson.id)}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>

                                    {isCreatingLesson === module.id && (
                                        <form
                                            action={(formData) => handleAddLesson(module.id, formData)}
                                            className="flex items-center gap-2 p-2 pl-4 animate-in fade-in"
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

            {/* Library Dialog */}
            <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Module Library</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                        ) : availableModules.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">No modules available to add.</p>
                        ) : (
                            availableModules.map(module => (
                                <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                                    <div>
                                        <h4 className="font-medium">{module.title}</h4>
                                        <p className="text-xs text-muted-foreground">ID: {module.id.split('-')[0]}...</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleLinkModule(module.id)}>
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLibraryOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                <div className="grid gap-2">
                                    <Label>Resource (PDF/Material)</Label>
                                    <FileUpload
                                        value={isEditingLesson.resource_url || ""}
                                        onChange={(url: string) => setIsEditingLesson({ ...isEditingLesson, resource_url: url })}
                                        bucket="course-resources"
                                        label=""
                                        name="resource_url"
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
                            <MarkdownHint />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditingLesson(null)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            {/* Edit Module Dialog */}
            <Dialog open={!!isEditingModule} onOpenChange={(open) => !open && setIsEditingModule(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Module</DialogTitle>
                    </DialogHeader>
                    {isEditingModule && (
                        <form action={handleUpdateModule} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="module_title">Module Title</Label>
                                <Input
                                    id="module_title"
                                    name="title"
                                    defaultValue={isEditingModule.title}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="module_description">Description</Label>
                                <Textarea
                                    id="module_description"
                                    name="description"
                                    className="min-h-[100px]"
                                    defaultValue={isEditingModule.description}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_completion_requirements">Completion Requirement Info</Label>
                                <Input
                                    id="edit_completion_requirements"
                                    name="completion_requirements"
                                    defaultValue={isEditingModule.completion_requirements}
                                    placeholder="e.g. Complete all lessons..."
                                />
                            </div>
                            <MarkdownHint />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditingModule(null)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function SortableLessonItem({ lesson, courseId, onEdit, onDelete }: {
    lesson: any,
    courseId: string,
    onEdit: () => void,
    onDelete: () => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lesson.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 rounded-md border bg-background hover:bg-accent/5 transition-colors group ${isDragging ? 'opacity-50 shadow-lg border-primary' : ''}`}
        >
            <button
                type="button"
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-accent rounded"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </button>

            {lesson.video_url ? (
                <Video className="h-4 w-4 text-primary" />
            ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
            )}

            <div className="flex-1 flex flex-col">
                <span className="text-sm font-medium">{lesson.title}</span>
                {lesson.resource_url && (
                    <span className="text-[10px] text-primary truncate flex items-center gap-1 mt-0.5">
                        <FileText className="h-3 w-3" /> {lesson.resource_url.split('/').pop()}
                    </span>
                )}
            </div>

            {lesson.is_preview && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Preview</span>}

            <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary group-hover:opacity-100 sm:opacity-0 transition-opacity" asChild title="Manage Quiz">
                    <Link href={`/admin/training/${courseId}/lessons/${lesson.id}/assessment`}>
                        <FileText className="h-4 w-4" />
                    </Link>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary group-hover:opacity-100 sm:opacity-0 transition-opacity" onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive group-hover:opacity-100 sm:opacity-0 transition-opacity" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
