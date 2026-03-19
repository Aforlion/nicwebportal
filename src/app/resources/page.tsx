"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    BookOpen,
    Download,
    ChevronRight,
    Filter,
    Calendar,
    ArrowUpRight,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { getResources } from "@/actions/resources"
import { format } from "date-fns"

const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'research', name: 'Research & Papers' },
    { id: 'policy', name: 'Policy Documents' },
    { id: 'guide', name: 'Caregiving Guides' },
    { id: 'news', name: 'Institute News' }
]

export default function ResourcesPage() {
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchResources()
    }, [activeCategory])

    async function fetchResources() {
        setLoading(true)
        const { resources: data, error } = await getResources({
            category: activeCategory,
            onlyPublished: true
        })
        if (!error) {
            setResources(data || [])
        }
        setLoading(false)
    }

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-secondary text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <Badge className="bg-primary hover:bg-primary/90 text-white mb-6 px-4 py-1.5 rounded-full border-none font-bold tracking-widest uppercase text-[10px]">
                        Knowledge Center
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Resources & Research</h1>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                        Your professional gateway to caregiving research, policy updates, and expert-authored guides.
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="container mx-auto px-6 -translate-y-1/2">
                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, topic or keyword..."
                            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={activeCategory === cat.id ? "default" : "ghost"}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`rounded-xl whitespace-nowrap h-14 px-6 font-bold transition-all ${activeCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 pb-24">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] h-[450px] animate-pulse border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border shadow-sm max-w-4xl mx-auto mt-8">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter className="h-10 w-10 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary mb-2">No Resources Found</h2>
                        <p className="text-muted-foreground mb-8">Try adjusting your filters or search terms.</p>
                        <Button variant="outline" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="rounded-xl h-11 px-8">
                            Clear all filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredResources.map((item) => (
                            <Link key={item.id} href={`/resources/${item.slug}`} className="group block h-full">
                                <Card className="h-full border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white flex flex-col group-hover:-translate-y-2">
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shrink-0">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                                                <div className="h-16 w-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                                                    {item.resource_type === 'download' ? <Download size={32} /> : <BookOpen size={32} />}
                                                </div>
                                            </div>
                                        )}

                                        {/* Overlay Tags */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <Badge className="bg-white/90 backdrop-blur text-secondary hover:bg-white border-none text-[9px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                                                {item.category.replace(/-/g, ' ')}
                                            </Badge>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <div className="h-14 w-14 bg-primary text-white rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                                                {item.resource_type === 'download' ? <Download size={24} /> : <ArrowUpRight size={24} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <CardContent className="p-8 flex-grow flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                {format(new Date(item.created_at), 'MMMM dd, yyyy')}
                                            </span>
                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                                                {item.resource_type}
                                            </span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                                            {item.excerpt || "Dive into this comprehensive resource from the National Institute of Caregivers knowledge center."}
                                        </p>

                                        <div className="pt-6 border-t border-slate-100 mt-auto flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {item.author?.avatar_url ? (
                                                        <img src={item.author.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-400">NIC</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">
                                                    {item.author?.full_name || "Institute Staff"}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="bg-white border-t py-20">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h2 className="text-3xl font-black text-secondary mb-4 tracking-tight">Support Our Research</h2>
                    <p className="text-muted-foreground mb-8 text-lg">Help us continue our mission of professionalizing caregiving through evidenced-based research and advocacy.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/contact">
                            <Button className="bg-primary h-14 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">Get Involved</Button>
                        </Link>
                        <Link href="/programs">
                            <Button variant="outline" className="h-14 px-10 rounded-2xl font-bold text-lg border-2">Explore Training</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
