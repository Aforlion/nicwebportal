"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, ShieldCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const navItems = [
    { title: "Home", href: "/" },
    { title: "About NIC", href: "/about" },
    {
        title: "Programs",
        href: "/programs",
        children: [
            { title: "All Programs", href: "/programs" },
            { title: "Healthcare Assistant", href: "/programs/hca" },
            { title: "Specialty Care", href: "/programs/specialty" },
        ],
    },
    { title: "Membership", href: "/membership" },
    { title: "Verify", href: "/verify" },
    { title: "Store", href: "/store" },
]

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold tracking-tighter text-primary flex items-center gap-1">
                            <ShieldCheck className="h-8 w-8 text-accent" />
                            NIC
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
                                        <Link href={item.href} legacyBehavior passHref>
                                            <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                                                {item.title}
                                            </NavigationMenuLink>
                                        </Link>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Login
                            </Link>
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
                <div className="md:hidden border-t bg-background p-4 animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="text-lg font-medium hover:text-primary transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.title}
                            </Link>
                        ))}
                        <hr className="my-2" />
                        <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild onClick={() => setIsOpen(false)}>
                            <Link href="/programs">Enrol Now</Link>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    )
}
