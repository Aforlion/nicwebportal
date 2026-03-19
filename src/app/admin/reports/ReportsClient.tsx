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

interface ReportsClientProps {
    data: {
        stats: {
            revenue: { value: string; change: string; trend: 'up' | 'down' }
            members: { value: string; change: string; trend: 'up' | 'down' }
            compliance: { value: string; change: string; trend: 'up' | 'down' }
            completions: { value: string; change: string; trend: 'up' | 'down' }
        }
        breakdown: {
            full: number
            associate: number
            student: number
        }
        chartData: Array<{ month: string; amount: number }>
    }
}

export default function ReportsClient({ data }: ReportsClientProps) {
    const { stats, breakdown, chartData } = data
    const totalMembers = breakdown.full + breakdown.associate + breakdown.student

    // Normalize chart heights
    const maxAmount = Math.max(...chartData.map(d => d.amount), 1)

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
                    { title: "Monthly Revenue", ...stats.revenue, icon: CreditCard },
                    { title: "Active Members", ...stats.members, icon: Users },
                    { title: "Facility Compliance", ...stats.compliance, icon: Building2 },
                    { title: "Course Completions", ...stats.completions, icon: BarChart3 },
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
                {/* Growth Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue & Growth</CardTitle>
                        <CardDescription>Monthly breakdown of membership fees vs publications.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-end gap-3 px-6 pb-6 pt-10">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-grow group relative h-full flex items-end">
                                <div
                                    className="bg-primary/20 hover:bg-primary transition-colors rounded-t-sm w-full"
                                    style={{ height: `${(d.amount / maxAmount) * 100 || 5}%` }}
                                />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    ₦{d.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <div className="px-6 pb-6 pt-2 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {chartData.map(d => <span key={d.month}>{d.month}</span>)}
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
                                <p className="text-2xl font-black text-secondary">{totalMembers.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Total</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: "Professional Members", count: breakdown.full, color: "bg-primary" },
                                { label: "Associate", count: breakdown.associate, color: "bg-accent" },
                                { label: "Students", count: breakdown.student, color: "bg-slate-200" },
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
        </div>
    )
}
