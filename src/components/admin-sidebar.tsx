"use client"

import Link from "next/link"
import Image from "next/image"
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
    BookOpen,
    Newspaper,
    Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

export const adminNavItems = [
    { title: "Overview", href: "/admin", icon: LayoutDashboard },
    { title: "Students", href: "/admin/students", icon: GraduationCap },
    { title: "Members", href: "/admin/members", icon: Users },
    { title: "CPD Review", href: "/admin/cpd-review", icon: GraduationCap },
    { title: "Caregivers", href: "/admin/registry/caregivers", icon: Search },
    { title: "Facilities", href: "/admin/registry/facilities", icon: Building2 },
    { title: "Training (LMS)", href: "/admin/training", icon: BookOpen },
    { title: "Payments", href: "/admin/payments", icon: CreditCard },
    { title: "Inspections", href: "/admin/inspections", icon: ShieldCheck },
    { title: "News & Events", href: "/admin/news", icon: Newspaper },
    { title: "Advocacy/Docs", href: "/admin/advocacy", icon: FileText },
    { title: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { title: "Reports", href: "/admin/reports", icon: BarChart3 },
]

interface AdminSidebarProps {
    className?: string
    onNavigate?: () => void
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
    const pathname = usePathname()

    return (
        <aside className={cn("fixed left-0 top-0 z-40 h-screen w-64 border-r bg-secondary text-secondary-foreground transition-transform hidden md:block", className)}>
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-10 flex items-center gap-2 px-4">
                    <Image src="/logo.jpg" alt="NIC Logo" width={32} height={32} className="h-8 w-8 rounded bg-white p-0.5" />
                    <span className="text-2xl font-bold tracking-tighter text-white">NIC Admin</span>
                </div>

                <ul className="space-y-2 font-medium">
                    {adminNavItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-r from-primary/20 to-transparent text-white shadow-sm"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    )}
                                    <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-amber-500" : "")} />
                                    <span className={cn("font-medium", isActive ? "translate-x-1" : "")}>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                <div className="mt-auto space-y-2 border-t border-slate-700 pt-4 font-medium">
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                        onClick={onNavigate}
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
