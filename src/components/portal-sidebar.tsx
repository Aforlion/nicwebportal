"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
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
    Users,
    UserPlus,
    Contact,
    FileText,
    History,
    CheckSquare,
    Globe,
    ExternalLink,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PortalSidebarProps {
    role: 'student' | 'member' | 'facility'
}

export function PortalSidebar({ role }: PortalSidebarProps) {
    const pathname = usePathname()

    const handleLogout = async () => {
        try {
            const { createClient } = await import("@/lib/supabase")
            const supabase = createClient()
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            window.location.href = '/login'
        } catch (error: any) {
            console.error("Logout failed:", error)
        }
    }

    const studentNavItems = [
        { title: "Dashboard", href: "/portal/student", icon: LayoutDashboard },
        { title: "Profile", href: "/portal/student/profile", icon: User },
        { title: "Documents", href: "/portal/student/documents", icon: FileText },
        { title: "My Courses", href: "/portal/student/courses", icon: BookOpen },
        { title: "Exams", href: "/portal/student/exams", icon: GraduationCap },
        { title: "Internship", href: "/portal/student/internship", icon: Calendar },
        { title: "Certificates", href: "/portal/student/certificates", icon: Award },
        { title: "Transcript", href: "/portal/student/transcript", icon: FileText },
    ]

    const memberNavItems = [
        { title: "Dashboard", href: "/portal/member", icon: LayoutDashboard },
        { title: "Profile", href: "/portal/member/profile", icon: User },
        { title: "Documents", href: "/portal/member/documents", icon: FileText },
        { title: "CPD Records", href: "/portal/member/cpd", icon: History },
        { title: "Payments", href: "/portal/member/payments", icon: CreditCard },
        { title: "ID Card", href: "/portal/member/id-card", icon: Contact },
    ]

    const [isAgency, setIsAgency] = useState(false)

    useEffect(() => {
        if (role === 'facility') {
            const checkFacilityType = async () => {
                try {
                    const { createClient } = await import("@/lib/supabase")
                    const supabase = createClient()
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                        const { data } = await supabase
                            .from('facilities')
                            .select('facility_type')
                            .eq('owner_id', user.id)
                            .single()
                        if (data && data.facility_type === 'agency') {
                            setIsAgency(true)
                        }
                    }
                } catch (e) {
                    console.error("Error checking facility type in sidebar:", e)
                }
            }
            checkFacilityType()
        }
    }, [role])

    const facilityNavItems = [
        { title: "Dashboard", href: "/portal/facility", icon: LayoutDashboard },
        { title: isAgency ? "Caregivers Directory" : "Staff Directory", href: "/portal/facility/staff", icon: Users },
        { title: isAgency ? "Connect Caregiver" : "Link Caregiver", href: "/portal/facility/link", icon: UserPlus },
        { title: "Inspections", href: "/portal/facility/inspections", icon: CheckSquare },
        { title: "Accreditation", href: "/portal/facility/accreditation", icon: ShieldCheck },
        { title: "Documents & Certificates", href: "/portal/facility/certificates", icon: FileText },
    ]

    const navItems = role === 'student' ? studentNavItems : (role === 'member' ? memberNavItems : facilityNavItems)

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-6 flex items-center gap-2 px-4 shrink-0">
                    <Image src="/logo.jpg" alt="NIC Logo" width={32} height={32} className="h-8 w-8 rounded" />
                    <span className="text-2xl font-bold tracking-tighter text-secondary">
                        NIC Portal
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto space-y-1 mb-4 custom-scrollbar">
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

                <div className="mt-auto space-y-1 border-t pt-4 shrink-0">
                    {/* Role-based cross links */}
                    {role === 'member' && (
                        <Link
                            href="/portal/student"
                            className="flex items-center gap-3 rounded-lg px-4 py-1 text-xs font-semibold text-primary/80 transition-colors hover:bg-primary/5"
                        >
                            <GraduationCap className="h-4 w-4" />
                            <span>Learning Portal</span>
                        </Link>
                    )}
                    {role === 'student' && (
                        <Link
                            href="/portal/member"
                            className="flex items-center gap-3 rounded-lg px-4 py-1 text-xs font-semibold text-primary/80 transition-colors hover:bg-primary/5"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            <span>Membership Portal</span>
                        </Link>
                    )}

                    {/* Course & website shortcuts */}
                    <Link
                        href="/resources"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <BookOpen className="h-5 w-5" />
                        <span>Knowledge Center</span>
                    </Link>
                    <Link
                        href="/programs"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                        <GraduationCap className="h-5 w-5" />
                        <span>Browse Courses</span>
                    </Link>
                    <Link
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <Globe className="h-5 w-5" />
                        <span className="flex items-center gap-1">
                            Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                        </span>
                    </Link>
                    <Link
                        href={`/portal/${role}/settings`}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </Link>
                    <button
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}
