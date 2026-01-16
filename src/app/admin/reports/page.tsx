"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    BarChart3,
    TrendingUp,
    Users,
    Building2,
    CreditCard,
    Download,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"

export default function AdminReportsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-secondary">Institutional Analytics</h1>
                    <p className="text-muted-foreground">Comprehensive reporting on membership, training, and regulatory compliance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    <Button className="bg-primary">
                        <Download className="mr-2 h-4 w-4" />
                        Generate PDF Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Revenue", value: "₦4.2M", change: "+12.5%", trend: "up", icon: CreditCard },
                    { title: "Active Members", value: "1,240", change: "+8.2%", trend: "up", icon: Users },
                    { title: "Facility Compliance", value: "82%", change: "-2.1%", trend: "down", icon: Building2 },
                    { title: "Course Completions", value: "856", change: "+18%", trend: "up", icon: BarChart3 },
                ].map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className={`flex items-center text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-destructive'}`}>
                                    {stat.change}
                                    {stat.trend === 'up' ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Growth Chart Placeholder */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue & Growth</CardTitle>
                        <CardDescription>Monthly breakdown of membership fees vs publications.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-end gap-3 px-6 pb-6">
                        {[40, 65, 45, 90, 75, 55, 80, 100, 85, 60, 40, 70].map((height, i) => (
                            <div key={i} className="flex-grow group relative">
                                <div
                                    className="bg-primary/20 hover:bg-primary transition-colors rounded-t-sm w-full"
                                    style={{ height: `${height}%` }}
                                />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ₦{height * 10}k
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <div className="px-6 pb-6 pt-2 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </Card>

                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Member Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="h-48 w-48 mx-auto rounded-full border-[16px] border-primary flex items-center justify-center relative">
                            <div className="h-48 w-48 absolute rounded-full border-[16px] border-accent border-l-transparent border-b-transparent border-r-transparent -rotate-45" />
                            <div className="text-center">
                                <p className="text-2xl font-black text-secondary">1,240</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Total</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: "Full Members", count: "540", color: "bg-primary" },
                                { label: "Associate", count: "320", color: "bg-accent" },
                                { label: "Students", count: "380", color: "bg-slate-200" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${item.color}`} />
                                        <span className="text-muted-foreground">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-secondary">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Regulatory Risks</CardTitle>
                        <CardDescription>Facilities with pending critical inspections.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[
                                { name: "Lagos Haven", risk: "Critical", days: "14 Days Overdue" },
                                { name: "Abuja Sanctuary", risk: "High", days: "5 Days Overdue" },
                                { name: "Mercy Home Ibadan", risk: "Medium", days: "Due Tomorrow" },
                            ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-4 px-6 hover:bg-muted/30">
                                    <div>
                                        <p className="font-bold text-secondary text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.days}</p>
                                    </div>
                                    <Badge variant="outline" className={`font-bold text-[10px] ${item.risk === 'Critical' ? 'border-red-200 bg-red-50 text-red-700' :
                                        item.risk === 'High' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                            'border-blue-200 bg-blue-50 text-blue-700'
                                        }`}>
                                        {item.risk}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Publications</CardTitle>
                        <CardDescription>Most downloaded resources this month.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[
                                { title: "2024 Care Standards", sales: "245", revenue: "₦3.0M" },
                                { title: "Geriatric Toolkit", sales: "182", revenue: "₦1.4M" },
                                { title: "Infection Control Set", sales: "94", revenue: "₦420k" },
                            ].map((item) => (
                                <div key={item.title} className="flex items-center justify-between p-4 px-6 hover:bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <p className="font-bold text-secondary text-sm">{item.title}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-secondary text-sm">{item.revenue}</p>
                                        <p className="text-xs text-muted-foreground">{item.sales} sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
