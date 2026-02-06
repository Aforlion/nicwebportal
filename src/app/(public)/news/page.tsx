import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ArrowRight, Newspaper } from "lucide-react"
import Link from "next/link"
import { getNewsEvents } from "@/actions/news-publications"
import { format } from "date-fns"

export default async function NewsPage() {
    const newsItems = await getNewsEvents()

    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-secondary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        News & Events
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Stay updated with the latest happenings, press releases, and upcoming events from the National Institute of Caregivers.
                    </p>
                </div>
            </section>

            {/* News Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    {newsItems.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-xl">
                            <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-secondary">No News or Events Found</h3>
                            <p className="text-muted-foreground mt-2">We'll be posting updates soon. Stay tuned!</p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {newsItems.map((item: any) => (
                                <Card key={item.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                                    <div className="aspect-video w-full bg-slate-100 relative">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                                                <Newspaper size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <Badge className={item.type === 'event' ? 'bg-amber-600' : 'bg-primary'}>
                                                {item.type.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(item.published_at), 'MMMM dd, yyyy')}
                                        </div>
                                        <CardTitle className="text-xl text-secondary line-clamp-2">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground line-clamp-3 text-sm">
                                            {item.excerpt || item.content.substring(0, 150) + "..."}
                                        </p>
                                        {item.type === 'event' && item.location && (
                                            <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                                                <MapPin className="h-4 w-4" />
                                                {item.location}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="border-t pt-4">
                                        <Button variant="ghost" className="text-primary p-0 h-auto font-bold flex items-center gap-2 group" asChild>
                                            <Link href={`/news/${item.slug}`}>
                                                Read More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
