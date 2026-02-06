import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, FileText, CreditCard, ArrowUpRight, ShieldCheck, Search, Activity, MoreHorizontal, Calendar, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const stats = [
    {
        title: "Total Students",
        value: "1,284",
        description: "+12% from last month",
        trend: "up",
        icon: GraduationCap,
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        title: "Certified Members",
        value: "842",
        description: "+5% from last month",
        trend: "up",
        icon: Users,
        color: "text-amber-600",
        bg: "bg-amber-100",
    },
    {
        title: "Active Programs",
        value: "12",
        description: "2 new this quarter",
        trend: "neutral",
        icon: FileText,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
    },
    {
        title: "Total Revenue",
        value: "₦4.2M",
        description: "+18% from last month",
        trend: "up",
        icon: CreditCard,
        color: "text-purple-600",
        bg: "bg-purple-100",
    },
]

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">
                        Welcome back, Administrator. You have <span className="font-medium text-amber-600">3 pending tasks</span> today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white">
                        <Calendar className="mr-2 h-4 w-4" />
                        Jan 20, 2026 - Jan 29, 2026
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <stat.icon className={`h-24 w-24 ${stat.color}`} />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="z-10 relative">
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <p className="flex items-center text-xs font-medium text-slate-500">
                                <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mr-2">
                                    <ArrowUpRight className="mr-1 h-3 w-3" />
                                    {stat.description.split(" ")[0]}
                                </span>
                                from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="col-span-1 lg:col-span-2 border-none shadow-sm overflow-hidden order-2 lg:order-1">
                    <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between py-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">Recent Activity</CardTitle>
                            <CardDescription className="hidden sm:block">Latest registrations and payments</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                                    <Avatar className="h-10 w-10 border border-slate-100">
                                        <AvatarFallback className={`text-xs font-bold ${i % 2 === 0 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                            }`}>
                                            {i % 2 === 0 ? "JD" : "SM"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                {i % 2 === 0 ? "John Doe registered for Course" : "Sarah Mullins paid membership"}
                                            </p>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">2h ago</span>
                                        </div>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Activity className="h-3 w-3" />
                                            {i % 2 === 0 ? "Healthcare Assistant Program" : "Full Membership Renewal"}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & Notifications */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative">
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <ShieldCheck className="w-40 h-40" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                Registry Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                                    <span className="text-white/80 text-sm">Pending Verifications</span>
                                    <span className="font-bold text-xl">14</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/80 text-sm">New Facilities</span>
                                    <span className="font-bold text-xl">3</span>
                                </div>
                                <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold mt-4 shadow-lg">
                                    Go to Registry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">New Course</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                <div className="p-2 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Verify ID</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Reports</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20 group">
                                <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                                    <Search className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Find Member</span>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
