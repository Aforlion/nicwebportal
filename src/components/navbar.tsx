"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User } from "lucide-react"
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
        title: "Resources",
        href: "/store",
        children: [
            { title: "Digital Store", href: "/store" },
            { title: "Advocacy & Research", href: "/advocacy" },
            { title: "Media Gallery", href: "/gallery" },
            { title: "News & Events", href: "/news" },
        ]
    },
]

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/logo.jpg"
                            alt="NIC Logo"
                            width={40}
                            height={40}
                            className="h-10 w-auto rounded"
                        />
                        <span className="text-2xl font-bold tracking-tighter text-primary">
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
                            <Button variant="outline" className="w-full justify-start gap-2" asChild onClick={() => setIsOpen(false)}>
                                <Link href="/login">
                                    <User className="h-4 w-4" />
                                    Login
                                </Link>
                            </Button>
                            <Button className="w-full bg-primary" asChild onClick={() => setIsOpen(false)}>
                                <Link href="/programs">Enrol Now</Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
