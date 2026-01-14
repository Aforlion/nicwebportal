"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingBag,
    BookOpen,
    FileDown,
    Search,
    Filter,
    Star,
    CheckCircle2,
    ArrowRight
} from "lucide-react"
import Link from "next/link"

const products = [
    {
        id: "p1",
        title: "National Caregiver Standard Manual",
        description: "The official 2024 handbook for professional care standards in Nigeria.",
        price: "₦12,500",
        category: "Manuals",
        rating: 4.8,
        reviews: 124,
        type: "Digital PDF",
    },
    {
        id: "p2",
        title: "Geriatric Care Mastery Toolkit",
        description: "A comprehensive set of tools, templates, and checklists for elderly care.",
        price: "₦8,000",
        category: "Toolkits",
        rating: 4.9,
        reviews: 86,
        type: "Digital Download",
    },
    {
        id: "p3",
        title: "Infection Control Protocol Poster Set",
        description: "High-resolution printable posters for care facility compliance.",
        price: "₦4,500",
        category: "Publications",
        rating: 4.7,
        reviews: 42,
        type: "Printable PDF",
    },
    {
        id: "p4",
        title: "NIC Ethics & Professional Conduct",
        description: "Mandatory reading for all registered members of the institute.",
        price: "Free",
        category: "Manuals",
        rating: 5.0,
        reviews: 512,
        type: "Digital PDF",
    },
]

export default function StorePage() {
    const [search, setSearch] = useState("")

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="pb-20">
            {/* Hero */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <ShoppingBag className="mx-auto mb-6 h-12 w-12 text-accent" />
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                        NIC Digital Store
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Professional resources, official manuals, and clinical toolkits to elevate your caregiving practice.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    {/* Controls */}
                    <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="relative max-w-md flex-grow">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search resources, manuals, toolkits..."
                                className="pl-12 h-12 text-lg"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="h-12 px-6">
                                <Filter className="mr-2 h-4 w-4" />
                                Categories
                            </Button>
                            <Button className="h-12 px-6 bg-secondary text-white">
                                My Downloads
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <Card key={product.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-xl border-2 hover:border-primary/20">
                                <div className="aspect-[4/5] bg-muted/30 p-8 flex items-center justify-center relative overflow-hidden">
                                    <BookOpen className="h-20 w-20 text-muted-foreground opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-primary font-bold">
                                            {product.type}
                                        </Badge>
                                    </div>
                                    {product.price === "Free" && (
                                        <div className="absolute top-4 right-4 animate-pulse">
                                            <Badge className="bg-emerald-500 text-white border-none font-bold">
                                                FREE
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{product.category}</p>
                                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                            <Star className="h-3 w-3 fill-current" />
                                            {product.rating}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-secondary group-hover:text-primary transition-colors cursor-pointer">
                                        {product.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {product.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="border-t pt-6 bg-muted/10">
                                    <div className="flex w-full items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Price</p>
                                            <p className="text-2xl font-black text-secondary">{product.price}</p>
                                        </div>
                                        <Button className="bg-primary rounded-full px-6" size="sm" asChild>
                                            <Link href={`/store/${product.id}`}>
                                                <FileDown className="mr-2 h-4 w-4" />
                                                Get Now
                                            </Link>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Promotional Box */}
                    <div className="mt-20 rounded-3xl bg-secondary p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div>
                                <Badge className="bg-accent text-secondary font-bold mb-4">MEMBER EXCLUSIVE</Badge>
                                <h2 className="text-4xl font-bold mb-6 tracking-tight">Access the Full Digital Library</h2>
                                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                    NIC Registered Members get 40% off all premium publications and full access to the National Repository of Care Research.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button className="bg-white text-secondary hover:bg-slate-100 px-8 h-12 font-bold" asChild>
                                        <Link href="/join">Become a Member</Link>
                                    </Button>
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 h-12" asChild>
                                        <Link href="/membership">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden lg:grid grid-cols-2 gap-4">
                                {[
                                    { title: "Standard Guidelines", icon: CheckCircle2 },
                                    { title: "Case Studies", icon: CheckCircle2 },
                                    { title: "Legal Frameworks", icon: CheckCircle2 },
                                    { title: "Clinical Checklists", icon: CheckCircle2 },
                                ].map((item) => (
                                    <div key={item.title} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center gap-3">
                                        <item.icon className="h-6 w-6 text-accent" />
                                        <span className="font-medium">{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
