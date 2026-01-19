import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import PaystackButton from "@/components/enrollment/paystack-button"
import EnrollFreeButton from "@/components/enrollment/enroll-free-button"
import { Check, ShieldCheck, Clock, BookOpen, User } from "lucide-react"

export default async function EnrollmentPage({ params }: { params: { courseId: string } }) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch course details
    const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', params.courseId)
        .eq('is_published', true)
        .single()

    if (error || !course) {
        notFound()
    }

    // Check existing enrollment
    if (user) {
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .single()

        if (existing) {
            redirect(`/portal/student/courses/${course.id}`)
        }
    }

    if (!user) {
        // Redirect to login with return url if not authenticated
        // For now, let's just show a message or redirect to login
        redirect(`/login?next=/portal/student/enroll/${course.id}`)
    }

    const benefits = [
        "Full access to all course materials",
        "Certificate of completion",
        "24/7 access to learning platform",
        "Expert instructor support"
    ]

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                    <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-6">
                        {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                <BookOpen className="h-12 w-12 text-slate-400" />
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                    <p className="text-muted-foreground mb-6 line-clamp-3">{course.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                            <Clock className="h-3 w-3" /> {course.duration_hours} Hours
                        </span>
                        <span className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                            <BookOpen className="h-3 w-3" /> {course.level || "Certification"}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold">What's included:</h3>
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-green-500" />
                                {benefit}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:pl-8">
                    <Card className="border-2 shadow-lg sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Review your enrollment details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium text-muted-foreground">Course Price</span>
                                <span className="text-xl font-bold">
                                    {course.price > 0 ? `₦${course.price.toLocaleString()}` : "Free"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="font-medium">Total Due</span>
                                <span className="text-2xl font-bold text-primary">
                                    {course.price > 0 ? `₦${course.price.toLocaleString()}` : "Free"}
                                </span>
                            </div>

                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex gap-2">
                                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold block">Secure Enrollment</span>
                                    Your information is encrypted and secure.
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">Enrolling as</p>
                                    <p className="text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {course.price > 0 ? (
                                <PaystackButton
                                    courseId={course.id}
                                    amount={course.price}
                                    courseTitle={course.title}
                                    email={user.email || ""}
                                />
                            ) : (
                                <EnrollFreeButton courseId={course.id} />
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
