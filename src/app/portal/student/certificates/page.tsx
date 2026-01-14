import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Share2, ShieldCheck, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"

const certificates = [
    {
        id: "CERT-HCA-2024-8829",
        title: "Healthcare Assistant (HCA) - Professional Bundle",
        issueDate: "Jan 10, 2024",
        status: "Verified",
        grade: "Distinction",
        category: "Professional Certification",
    }
]

export default function StudentCertificatesPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">My Certificates</h1>
                    <p className="text-muted-foreground">Download and share your official NIC certifications.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {certificates.length > 0 ? (
                    certificates.map((cert) => (
                        <Card key={cert.id} className="overflow-hidden border-2 border-primary/10 group">
                            <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="bg-primary/5 p-3 rounded-2xl mb-4 text-primary">
                                        <Award className="h-10 w-10" />
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 uppercase font-bold text-[10px] tracking-widest">
                                        <ShieldCheck className="mr-1 h-3 w-3" /> {cert.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl text-secondary">{cert.title}</CardTitle>
                                <CardDescription className="font-mono text-xs">{cert.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Issue Date</p>
                                        <p className="font-bold text-secondary flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" /> {cert.issueDate}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Grade</p>
                                        <p className="font-bold text-secondary">{cert.grade}</p>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Category</p>
                                    <p className="text-sm font-medium text-secondary">{cert.category}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-3 pt-0">
                                <Button className="flex-grow bg-primary">
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                                <Button variant="outline" size="icon" asChild>
                                    <Link href={`/verify?id=${cert.id}`} title="Public Verification Link">
                                        <ExternalLink className="h-4 w-4 text-primary" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Share2 className="h-4 w-4 text-primary" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="lg:col-span-2 py-20 text-center">
                        <Award className="h-16 w-16 mx-auto mb-4 opacity-10" />
                        <p className="text-xl font-bold text-secondary">No certificates yet.</p>
                        <p className="text-muted-foreground mt-2">Finish your active courses to qualify for certification.</p>
                        <Button className="mt-6 bg-primary" asChild>
                            <Link href="/portal/student/courses">Go to My Courses</Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-6 bg-secondary text-white rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-sm">
                    <ShieldCheck className="h-32 w-32" />
                </div>
                <div className="relative z-10 max-w-xl">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-accent" />
                        Blockchain Verification
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        All NIC certificates are cryptographically signed and stored on our private ledger. This allows employers and international bodies to verify your credentials without contacting the registry office.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-accent mt-4 font-bold text-xs" asChild>
                        <Link href="/verify">Learn how verification works →</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
