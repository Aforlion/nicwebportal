import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, FileText, CreditCard, ArrowUpRight, ShieldCheck } from "lucide-react"

const stats = [
    {
        title: "Total Students",
        value: "1,284",
        description: "+12% from last month",
        icon: GraduationCap,
        color: "text-blue-600",
    },
    {
        title: "Certified Members",
        value: "842",
        description: "+5% from last month",
        icon: Users,
        color: "text-primary",
    },
    {
        title: "Active Programs",
        value: "12",
        description: "2 new this quarter",
        icon: FileText,
        color: "text-accent",
    },
    {
        title: "Total Revenue",
        value: "₦4.2M",
        description: "+18% from last month",
        icon: CreditCard,
        color: "text-emerald-600",
    },
]

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back, Administrator. Here's what's happening at NIC today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-secondary">{stat.value}</div>
                            <p className="flex items-center text-xs text-muted-foreground">
                                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-secondary">New student enrolment: Healthcare Assistant</p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                    <div className="text-sm font-bold text-secondary">₦75,000</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <button className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-primary/5">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            <span className="text-sm font-bold">New Course</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-accent hover:bg-accent/5">
                            <ShieldCheck className="h-8 w-8 text-accent" />
                            <span className="text-sm font-bold">New Inspection</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-blue-500 hover:bg-blue-50">
                            <Search className="h-8 w-8 text-blue-500" />
                            <span className="text-sm font-bold">Verify ID</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-slate-500 hover:bg-slate-50">
                            <FileText className="h-8 w-8 text-slate-500" />
                            <span className="text-sm font-bold">Generate Report</span>
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
