"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    ShieldCheck,
    Search,
    Building2,
    Settings,
    LogOut,
    FileText,
    CreditCard,
    BarChart3,
    BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

const adminNavItems = [
    { title: "Overview", href: "/admin", icon: LayoutDashboard },
    { title: "Students", href: "/admin/students", icon: GraduationCap },
    { title: "Members", href: "/admin/members", icon: Users },
    { title: "CPD Review", href: "/admin/cpd-review", icon: GraduationCap },
    { title: "Caregivers", href: "/admin/registry/caregivers", icon: Search },
    { title: "Facilities", href: "/admin/registry/facilities", icon: Building2 },
    { title: "Training (LMS)", href: "/admin/training", icon: BookOpen },
    { title: "Payments", href: "/admin/payments", icon: CreditCard },
    { title: "Inspections", href: "/admin/inspections", icon: ShieldCheck },
    { title: "Reports", href: "/admin/reports", icon: BarChart3 },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-secondary text-secondary-foreground transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-10 flex items-center gap-2 px-4">
                    <ShieldCheck className="h-8 w-8 text-accent" />
                    <span className="text-2xl font-bold tracking-tighter text-white">NIC Admin</span>
                </div>

                <ul className="space-y-2 font-medium">
                    {adminNavItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-white/10 hover:text-white",
                                        isActive ? "bg-primary text-white" : "text-slate-400"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                <div className="mt-auto space-y-2 border-t border-slate-700 pt-4 font-medium">
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </Link>
                    <button
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => console.log("Logout triggered")}
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}
