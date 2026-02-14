"use client"


import { Bell, Search, Menu, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

export function AdminHeader() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname() || ""
    const router = useRouter()
    const supabase = createClient()

    const segments = pathname.split('/').filter(Boolean).slice(1) // Remove 'admin'

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error("Logout failed: " + error.message)
        } else {
            toast.success("Logged out successfully")
            router.push('/login')
        }
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 bg-white/80 px-4 md:px-6 backdrop-blur-md border-b shadow-sm">
            <div className="flex flex-1 items-center gap-4 md:gap-8">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-none w-72">
                        <AdminSidebar className="block w-full h-full relative" onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>

                <div className="relative flex-1 max-w-md hidden lg:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search members, records..."
                        className="w-full bg-slate-50 pl-9 rounded-full border-slate-200 focus:bg-white transition-all h-9 text-sm"
                    />
                </div>

                <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden whitespace-nowrap">
                    <Link href="/admin" className="hover:text-primary transition-colors flex items-center">
                        <Home className="h-4 w-4 shrink-0" />
                    </Link>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                    <Link href="/admin" className="hover:text-primary transition-colors font-medium">
                        Admin
                    </Link>
                    {segments.map((segment, i) => {
                        const href = `/admin/${segments.slice(0, i + 1).join('/')}`
                        const isLast = i === segments.length - 1

                        return (
                            <div key={i} className="flex items-center gap-1">
                                <ChevronRight className="h-4 w-4 shrink-0" />
                                {isLast ? (
                                    <span className="capitalize text-slate-900 font-semibold">{segment.replace(/-/g, ' ')}</span>
                                ) : (
                                    <Link href={href} className="capitalize hover:text-primary transition-colors">
                                        {segment.replace(/-/g, ' ')}
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive border-2 border-white" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-slate-200">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/admin-avatar.png" alt="Admin" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">AD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Administrator</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    admin@nicregistry.org
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                        <DropdownMenuItem>System Logs</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
