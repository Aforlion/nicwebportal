import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Film, LayoutGrid, Camera, GraduationCap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getGalleryItems } from "@/actions/gallery"

export default async function GalleryPage() {
    const galleryItems = await getGalleryItems()
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-secondary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Media Gallery
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        A visual journey through our activities, training sessions, and events nationwide.
                    </p>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="all" className="w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                            <TabsList>
                                <TabsTrigger value="all" className="gap-2"><LayoutGrid className="h-4 w-4" /> All Media</TabsTrigger>
                                <TabsTrigger value="training" className="gap-2"><GraduationCap className="h-4 w-4" /> Training</TabsTrigger>
                                <TabsTrigger value="events" className="gap-2"><Camera className="h-4 w-4" /> Events</TabsTrigger>
                                <TabsTrigger value="videos" className="gap-2"><Film className="h-4 w-4" /> Videos</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="mt-0">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {galleryItems.map((item) => (
                                    <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-slate-200 aspect-video shadow-sm transition-all hover:shadow-xl">
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6">
                                            <span className="text-primary-foreground/80 text-[10px] font-bold uppercase tracking-wider mb-2">{item.category}</span>
                                            <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.type === 'video' ? <Film className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="training" className="mt-0">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {galleryItems.filter((i: any) => i.category === 'Training').map((item: any) => (
                                    <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-slate-200 aspect-video">
                                        <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white font-bold">{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="events" className="mt-0 text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-secondary">No Recent Events Media</h3>
                            <p className="text-muted-foreground mt-2">Check back after our next major convention!</p>
                        </TabsContent>

                        <TabsContent value="videos" className="mt-0 text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-secondary">No Videos Found</h3>
                            <p className="text-muted-foreground mt-2">Visit our YouTube channel for instructional videos.</p>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    )
}
