"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navItems = [
    { title: "Home", href: "/" },
    {
        title: "About NIC",
        href: "/about",
        children: [
            { title: "About Us", href: "/about" },
            { title: "Regulatory Framework", href: "/regulatory" },
            { title: "Contact Us", href: "/contact" },
        ]
    },
    {
        title: "Programs",
        href: "/programs",
        children: [
            { title: "All Programs", href: "/programs" },
            { title: "Healthcare Assistant", href: "/programs/hca" },
            { title: "Specialty Care", href: "/programs/specialty" },
        ],
    },
    {
        title: "Join NIC",
        href: "/join",
        children: [
            { title: "Individual Membership", href: "/join" },
            { title: "Institutional Registration", href: "/join/facility" },
        ],
    },
    { title: "Verify", href: "/verify" },
    {
        title: "Knowledge Center",
        href: "/resources",
        children: [
            { title: "Browse Resources", href: "/resources" },
            { title: "Advocacy & Research", href: "/advocacy" },
            { title: "Media Gallery", href: "/gallery" },
            { title: "News & Events", href: "/news" },
            { title: "Digital Store", href: "/store" },
        ]
    },
]

/** Determines the portal URL for a given user role */
function getPortalHref(role?: string): string {
    const adminRoles = ['admin', 'super_admin', 'registry_officer', 'inspector', 'auditor', 'instructor']
    if (role && adminRoles.includes(role)) return '/admin'
    if (role === 'student') return '/portal/student'
    if (role === 'facility_admin') return '/portal/facility'
    return '/portal/member'
}

/** User avatar — shows initials in a coloured circle */
function UserAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'

    return (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
        </div>
    )
}

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [user, setUser] = React.useState<SupabaseUser | null>(null)
    const [userRole, setUserRole] = React.useState<string | undefined>()
    const [displayName, setDisplayName] = React.useState<string>('')
    const supabase = createClient()

    React.useEffect(() => {
        const initAuth = async () => {
            // Use getUser() (not getSession()) — it validates server-side and does NOT
            // silently retry a stale refresh token in a loop on failure.
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                // Stale/invalid token in storage — wipe it to stop the refresh loop.
                await supabase.auth.signOut()
                return
            }
            setUser(user)
            const fullName = user.user_metadata?.full_name as string | undefined
            setDisplayName(fullName || user.email?.split('@')[0] || 'User')

            // Fetch role from profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', user.id)
                .single()
            if (profile) {
                setUserRole(profile.role)
                if (profile.full_name) setDisplayName(profile.full_name)
            }
        }
        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            if (event === 'SIGNED_OUT' || !session?.user) {
                setUser(null)
                setUserRole(undefined)
                setDisplayName('')
                return
            }

            // Only re-fetch profile on explicit sign-in or a successful token refresh —
            // not on every auth event, which could trigger unnecessary DB calls.
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setUser(session.user)
                const fullName = session.user.user_metadata?.full_name as string | undefined
                setDisplayName(fullName || session.user.email?.split('@')[0] || 'User')

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name')
                    .eq('id', session.user.id)
                    .single()
                if (profile) {
                    setUserRole(profile.role)
                    if (profile.full_name) setDisplayName(profile.full_name)
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const portalHref = getPortalHref(userRole)
    const firstName = displayName.split(' ')[0]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="flex items-center gap-1.5">
                            <Image
                                src="/logo.jpg"
                                alt="NIC Logo"
                                width={40}
                                height={40}
                                className="h-10 w-auto rounded"
                            />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter text-primary">
                            NIC Portal
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <NavigationMenu>
                        <NavigationMenuList className="gap-2">
                            {navItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    {item.children ? (
                                        <>
                                            <NavigationMenuTrigger className="bg-transparent hover:bg-accent/10">
                                                {item.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                    {item.children.map((child) => (
                                                        <li key={child.title}>
                                                            <NavigationMenuLink asChild>
                                                                <Link
                                                                    href={child.href}
                                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                                >
                                                                    <div className="text-sm font-medium leading-none">{child.title}</div>
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </>
                                    ) : (
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href={item.href}
                                                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                {item.title}
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex items-center gap-4">
                        {user ? (
                            // Logged-in user menu
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-secondary hover:bg-muted transition-colors focus:outline-none">
                                        <UserAvatar name={displayName} />
                                        <span className="max-w-[120px] truncate">{firstName}</span>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold">{displayName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={portalHref} className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            My Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Login
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild className="hidden lg:flex border-accent text-accent hover:bg-accent/5">
                            <Link href="/join/facility">Accredit Facility</Link>
                        </Button>
                        <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                            <Link href="/programs">Enrol Now</Link>
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden border-t bg-background animate-in slide-in-from-top duration-300 max-h-[calc(100svh-4rem)] overflow-y-auto">
                    <div className="p-4">
                    <nav className="flex flex-col gap-2">
                        <Accordion type="single" collapsible className="w-full border-none">
                            {navItems.map((item) => (
                                <React.Fragment key={item.title}>
                                    {item.children ? (
                                        <AccordionItem value={item.title} className="border-none">
                                            <AccordionTrigger className="text-lg font-medium py-3 hover:text-primary transition-colors hover:no-underline">
                                                {item.title}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex flex-col gap-2 pl-4 py-2 border-l-2 border-primary/10 ml-1">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.title}
                                                            href={child.href}
                                                            className="text-base text-muted-foreground hover:text-primary transition-colors py-1"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="text-lg font-medium py-3 hover:text-primary transition-colors block border-b last:border-0"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                        </Accordion>
                        <hr className="my-4" />
                        <div className="flex flex-col gap-3">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 px-1 py-2">
                                        <UserAvatar name={displayName} />
                                        <div>
                                            <p className="text-sm font-semibold">{displayName}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full justify-start gap-2" asChild onClick={() => setIsOpen(false)}>
                                        <Link href={portalHref}>
                                            <LayoutDashboard className="h-4 w-4" />
                                            My Dashboard
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                                        onClick={() => { setIsOpen(false); handleLogout() }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Log Out
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" className="w-full justify-start gap-2" asChild onClick={() => setIsOpen(false)}>
                                    <Link href="/login">
                                        <User className="h-4 w-4" />
                                        Login
                                    </Link>
                                </Button>
                            )}
                            <Button className="w-full bg-primary" asChild onClick={() => setIsOpen(false)}>
                                <Link href="/programs">Enrol Now</Link>
                            </Button>
                        </div>
                    </nav>
                    </div>
                </div>
            )}
        </header>
    )
}
