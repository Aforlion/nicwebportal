import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Shield, GraduationCap, Gavel, Search } from "lucide-react"
import { getPublications } from "@/actions/news-publications"
import { format } from "date-fns"

export default async function AdvocacyPage() {
    const publications = await getPublications()

    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Advocacy & Research
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Leading the conversation on professional caregiving in Nigeria. Access our policy briefs, research papers, and standards.
                    </p>
                </div>
            </section>

            {/* Main Sections */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Sidebar / Categories */}
                        <div className="space-y-8">
                            <div className="p-6 bg-muted/30 rounded-2xl border">
                                <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" /> Our Mandate
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    NIC advocates for better working conditions for caregivers and national standards that protect both care recipients and providers.
                                </p>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <Gavel className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span>Legislative advocacy for Caregiving standards.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span>Regulation of private care facilities.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span>Professional development frameworks.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 bg-secondary text-white rounded-2xl">
                                <h3 className="text-xl font-bold mb-4">Partner With Us</h3>
                                <p className="text-sm text-white/80 mb-6">
                                    Are you a research institution or NGO looking to collaborate on caregiving standards?
                                </p>
                                <Button variant="secondary" className="w-full">Get In Touch</Button>
                            </div>
                        </div>

                        {/* Publications List */}
                        <div className="lg:col-span-2 space-y-8">
                            <h2 className="text-3xl font-bold text-secondary">Publications & Briefs</h2>

                            {publications.length === 0 ? (
                                <div className="text-center py-16 bg-muted/20 rounded-xl border-2 border-dashed">
                                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-xl font-semibold text-secondary">No Publications Available</h3>
                                    <p className="text-muted-foreground mt-2">New research and policy briefs will be uploaded soon.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {publications.map((pub: any) => (
                                        <Card key={pub.id} className="hover:shadow-md transition-shadow group">
                                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary">
                                                            {pub.category}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {format(new Date(pub.published_at), 'MMMM yyyy')}
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-xl text-secondary">{pub.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground text-sm line-clamp-2">
                                                    {pub.abstract || "This publication outlines our latest research and policy recommendations regarding caregiver standards in Nigeria."}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex justify-between items-center border-t py-4">
                                                <span className="text-xs text-muted-foreground font-medium">By {pub.author || "NIC Research Dept."}</span>
                                                <Button size="sm" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white">
                                                    <Download className="h-4 w-4" /> Download PDF
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
