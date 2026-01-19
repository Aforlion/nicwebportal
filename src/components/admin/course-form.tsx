'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createCourse, updateCourse } from "@/actions/admin/manage-courses"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface CourseFormProps {
    course?: any
    mode: 'create' | 'edit'
}

export function CourseForm({ course, mode }: CourseFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)

        try {
            let result
            if (mode === 'create') {
                result = await createCourse(formData)
            } else {
                result = await updateCourse(course.id, formData)
            }

            if (result.error) {
                setError(result.error)
                setIsLoading(false)
            } else {
                // Success - redirect is handled in server action for revalidation usually, 
                // but we can also route here to be sure
                router.push('/admin/training')
                router.refresh()
            }
        } catch (e) {
            console.error(e)
            setError("Something went wrong. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-card p-6 rounded-lg border">
            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Advanced Dementia Care"
                        defaultValue={course?.title}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Detailed overview of what students will learn..."
                        className="min-h-[120px]"
                        defaultValue={course?.description}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (NGN)</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            placeholder="0"
                            defaultValue={course?.price}
                            required
                        />
                        <p className="text-xs text-muted-foreground">Set to 0 for free courses</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="duration_hours">Duration (Hours)</Label>
                        <Input
                            id="duration_hours"
                            name="duration_hours"
                            type="number"
                            placeholder="e.g. 12"
                            defaultValue={course?.duration_hours}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="level">Level</Label>
                        <select
                            id="level"
                            name="level"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={course?.level || "Certification"}
                        >
                            <option value="Foundation">Foundation</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Certification">Certification</option>
                            <option value="Specialty">Specialty</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                        <Input
                            id="thumbnail_url"
                            name="thumbnail_url"
                            placeholder="https://..."
                            defaultValue={course?.thumbnail_url}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_published"
                        name="is_published"
                        value="true"
                        defaultChecked={course?.is_published}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="is_published" className="font-normal cursor-pointer">
                        Publish immediately (Visible in catalog)
                    </Label>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Create Course' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}
