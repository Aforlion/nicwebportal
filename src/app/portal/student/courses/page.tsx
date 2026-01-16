"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock, Laptop, Filter, PlayCircle } from "lucide-react"
import Link from "next/link"

const allCourses = [
    {
        id: "hca-01",
        title: "Healthcare Assistant (HCA) - Foundation",
        description: "The official NIC entry-level program for professional caregivers.",
        duration: "12 Weeks",
        mode: "Blended",
        category: "Foundational",
        enrolled: true,
        progress: 65,
    },
    {
        id: "dementia-02",
        title: "Dementia Care Specialist",
        description: "Advanced cognitive care techniques and ethics.",
        duration: "6 Weeks",
        mode: "Online",
        category: "Specialty",
        enrolled: true,
        progress: 20,
    },
    {
        id: "elderly-03",
        title: "Elderly Care Management",
        description: "Specialized geriatric care and nutrition standards.",
        duration: "8 Weeks",
        mode: "Blended",
        category: "Specialty",
        enrolled: false,
        price: "₦60,000",
    },
    {
        id: "diabetes-04",
        title: "Diabetes Care for Seniors",
        description: "Managing insulin, diet, and glucose monitoring for elderly patients.",
        duration: "4 Weeks",
        mode: "Online",
        category: "CME",
        enrolled: false,
        price: "₦35,000",
    },
]

export default function StudentCoursesPage() {
    const [search, setSearch] = useState("")

    const filteredCourses = allCourses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
    )

    const myCourses = filteredCourses.filter(c => c.enrolled)
    const availableCourses = filteredCourses.filter(c => !c.enrolled)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Course Catalogue</h1>
                <p className="text-muted-foreground">Manage your current learning or explore new certifications.</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-grow">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            <Tabs defaultValue="my-courses" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="my-courses">My Courses ({myCourses.length})</TabsTrigger>
                    <TabsTrigger value="explore">Explore All ({availableCourses.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="my-courses" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {myCourses.map((course) => (
                            <Card key={course.id} className="group hover:shadow-md transition-all">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                            {course.category}
                                        </Badge>
                                        <span className="text-xs font-bold text-emerald-600">ENROLLED</span>
                                    </div>
                                    <CardTitle className="mt-2 text-xl text-secondary">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-muted-foreground">
                                    <p className="line-clamp-2">{course.description}</p>
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
                                        <span className="flex items-center gap-1"><Laptop className="h-4 w-4" /> {course.mode}</span>
                                    </div>
                                    <div className="space-y-1 pt-2">
                                        <div className="flex justify-between font-medium text-secondary">
                                            <span>Progress</span>
                                            <span>{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                            <div
                                                className="bg-primary h-full rounded-full"
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full bg-primary" asChild>
                                        <Link href={`/portal/student/courses/${course.id}`}>
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Resume Learning
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="explore" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {availableCourses.map((course) => (
                            <Card key={course.id} className="flex flex-col">
                                <CardHeader>
                                    <Badge variant="secondary" className="w-fit mb-2">
                                        {course.category}
                                    </Badge>
                                    <CardTitle className="text-lg text-secondary line-clamp-1">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                    <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                                        <span className="flex items-center gap-1"><Laptop className="h-3 w-3" /> {course.mode}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-lg font-bold text-secondary">{course.price}</span>
                                    <Button size="sm" asChild>
                                        <Link href={`/portal/student/courses/enrol/${course.id}`}>Enrol</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
