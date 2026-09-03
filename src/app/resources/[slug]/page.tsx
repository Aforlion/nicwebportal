import { getResourceBySlug } from "@/actions/resources"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
    Calendar,
    User as UserIcon,
    ChevronLeft,
    Download,
    Share2,
    Clock,
    BookOpen,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ResourceDetailPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
    const { slug } = await params
    const { resource, error } = await getResourceBySlug(slug)

    if (error || !resource) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/resources" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm">
                        <ArrowLeft size={18} />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                            <Share2 size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            <article className="pb-24">
                {/* Hero Header */}
                <header className="pt-12 md:pt-20 pb-12">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                {resource.category?.replace(/-/g, ' ')}
                            </Badge>
                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Clock size={12} />
                                {resource.resource_type === 'article' ? '5 min read' : 'Downloadable'}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-secondary mb-8 tracking-tight leading-[1.1]">
                            {resource.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border">
                                    {resource.author?.avatar_url ? (
                                        <img src={resource.author.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Written by</p>
                                    <p className="font-black text-secondary">{resource.author?.full_name || "Institute Staff"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 text-right">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Published</p>
                                    <p className="font-bold text-secondary">{format(new Date(resource.created_at), 'MMMM dd, yyyy')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {resource.image_url && (
                    <div className="container mx-auto px-6 max-w-6xl mb-16">
                        <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-2xl">
                            <img
                                src={resource.image_url}
                                alt={resource.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Main Content */}
                        <div className="flex-grow min-w-0">
                            {/* Excerpt/Lead */}
                            {resource.excerpt && (
                                <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-12 italic border-l-4 border-primary pl-8">
                                    {resource.excerpt}
                                </p>
                            )}

                            {/* Body Content */}
                            <div className="prose prose-slate prose-lg max-w-none">
                                <div className="text-slate-700 leading-[1.8] text-lg space-y-8 whitespace-pre-wrap">
                                    {resource.content}
                                </div>
                            </div>

                            {/* Resource Download Box */}
                            {resource.resource_type === 'download' && resource.file_url && (
                                <div className="mt-16 p-8 md:p-12 rounded-[2rem] bg-secondary text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                                        <div className="space-y-2">
                                            <Badge className="bg-primary/20 text-primary border-none mb-2">Resource File</Badge>
                                            <h3 className="text-2xl font-black">Download this resource</h3>
                                            <p className="text-slate-300">Get the full PDF document for offline reading and research.</p>
                                        </div>
                                        <a
                                            href={resource.file_url}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button className="bg-primary hover:bg-primary/90 text-white h-16 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform flex items-center gap-3">
                                                <Download size={22} />
                                                Download PDF
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Share & Support Footer */}
                            <div className="mt-24 pt-12 border-t flex flex-col items-center text-center space-y-6">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                                    <BookOpen className="text-primary h-8 w-8" />
                                </div>
                                <h4 className="text-xl font-bold text-secondary">Did you find this helpful?</h4>
                                <p className="text-muted-foreground max-w-md">Share this resource with your professional network or fellow caregivers.</p>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="rounded-xl h-12 px-6 font-bold flex items-center gap-2">
                                        <Share2 size={18} /> Share Article
                                    </Button>
                                    <Link href="/resources">
                                        <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold">More Resources</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    )
}
