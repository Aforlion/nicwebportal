import { Metadata } from "next"
import { getNewsBySlug } from "@/actions/news-publications"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, MapPin, Newspaper, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const item = await getNewsBySlug(slug)
    if (!item) return { title: "Not Found | NIC" }

    return {
        title: `${item.title} | NIC`,
        description: item.excerpt || item.content.substring(0, 160)
    }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const item = await getNewsBySlug(slug)

    if (!item) {
        notFound()
    }

    return (
        <article className="pb-20">
            {/* Header / Hero */}
            <div className="relative h-[400px] w-full bg-secondary overflow-hidden">
                {item.image_url && (
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                )}
                <div className="container relative h-full flex flex-col justify-end pb-12 mx-auto px-4 bg-gradient-to-t from-secondary to-transparent">
                    <div className="mb-6">
                        <Button variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                            <Link href="/news" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" /> Back to News
                            </Link>
                        </Button>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {item.type}
                        </span>
                        <span className="flex items-center gap-2 text-white/80 text-sm">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(item.published_at), 'MMMM dd, yyyy')}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white max-w-4xl tracking-tight">
                        {item.title}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        {item.location && (
                            <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3 text-primary font-bold">
                                <MapPin className="h-5 w-5" />
                                <span>Event Location: {item.location}</span>
                            </div>
                        )}
                        <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap">
                            {item.content}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="p-6 bg-muted/30 rounded-2xl border">
                            <h3 className="text-xl font-bold text-secondary mb-4">About NIC</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                The National Institute of Caregivers (NIC) is the apex professional body in Nigeria dedicated to the standardization and regulation of the caregiving industry.
                            </p>
                            <Button className="w-full bg-primary" asChild>
                                <Link href="/about">Learn More About Us</Link>
                            </Button>
                        </div>

                        <div className="p-6 bg-secondary text-white rounded-2xl">
                            <h3 className="text-xl font-bold mb-4">Join the Institute</h3>
                            <p className="text-sm text-white/80 mb-6">
                                Become a certified professional caregiver and join thousands of members nationwide.
                            </p>
                            <Button variant="secondary" className="w-full" asChild>
                                <Link href="/membership">Beome a Member</Link>
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    )
}
