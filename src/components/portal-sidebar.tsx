"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Award,
    Calendar,
    Settings,
    LogOut,
    CreditCard,
    User,
    ShieldCheck,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PortalSidebarProps {
    role: 'student' | 'member'
}

export function PortalSidebar({ role }: PortalSidebarProps) {
    const pathname = usePathname()

    const studentNavItems = [
        { title: "Dashboard", href: "/portal/student", icon: LayoutDashboard },
        { title: "My Courses", href: "/portal/student/courses", icon: BookOpen },
        { title: "Exams", href: "/portal/student/exams", icon: GraduationCap },
        { title: "Internship", href: "/portal/student/internship", icon: Calendar },
        { title: "Certificates", href: "/portal/student/certificates", icon: Award },
    ]

    const memberNavItems = [
        { title: "Dashboard", href: "/portal/member", icon: LayoutDashboard },
        { title: "Profile", href: "/portal/member/profile", icon: User },
        { title: "Documents", href: "/portal/member/documents", icon: FileText },
        { title: "CPD Records", href: "/portal/member/cpd", icon: GraduationCap },
        { title: "Payments", href: "/portal/member/payments", icon: CreditCard },
        { title: "ID Card", href: "/portal/member/id-card", icon: ShieldCheck },
    ]

    const navItems = role === 'student' ? studentNavItems : memberNavItems

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-10 flex items-center gap-2 px-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold tracking-tighter text-secondary">
                        NIC {role === 'student' ? 'Portal' : 'Member'}
                    </span>
                </div>

                <nav className="flex-grow space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-muted-foreground hover:bg-muted hover:text-secondary"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto space-y-1 border-t pt-4">
                    <Link
                        href={`/portal/${role}/settings`}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </Link>
                    <button
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
