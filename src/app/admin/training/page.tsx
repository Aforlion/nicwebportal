import { getAdminCourses } from "@/actions/admin/get-admin-courses"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, MoreVertical, Edit, Trash2, Eye, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

export default async function AdminTrainingPage() {
    const courses = await getAdminCourses()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Training Management</h1>
                    <p className="text-muted-foreground">Manage courses, modules, and lessons.</p>
                </div>
                <Button className="bg-primary" asChild>
                    <Link href="/admin/training/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Course
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Course Catalog</CardTitle>
                            <CardDescription>
                                Total Courses: {courses.length}
                            </CardDescription>
                        </div>
                        <div className="relative w-64 hidden md:block">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search courses..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-dashed border-2 rounded-lg bg-muted/10">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">No Courses Found</h3>
                            <p className="text-muted-foreground mb-4 max-w-sm">
                                You haven't created any training programs yet. Get started by creating your first course.
                            </p>
                            <Button asChild>
                                <Link href="/admin/training/new">Create Course</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {courses.map((course: any) => (
                                <div key={course.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start gap-4 w-full">
                                        <div className="h-16 w-24 bg-muted rounded-md overflow-hidden flex-shrink-0 relative">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                                    <BookOpen className="text-slate-400 h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                                <Badge variant={course.is_published ? "default" : "secondary"} className={course.is_published ? "bg-green-600" : ""}>
                                                    {course.is_published ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> {course.enrollmentCount} Enrolled
                                                </span>
                                                <span>•</span>
                                                <span>{course.level || "General"}</span>
                                                <span>•</span>
                                                <span>{course.price > 0 ? `₦${course.price.toLocaleString()}` : "Free"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/training/${course.id}`}>
                                                Builder
                                            </Link>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/training/${course.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/programs/${course.slug}`} target="_blank">
                                                        <Eye className="mr-2 h-4 w-4" /> Preview
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
