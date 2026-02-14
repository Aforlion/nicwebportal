import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Mail, ShieldCheck } from "lucide-react"

export default function RegistrationSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
            <Card className="w-full max-w-lg shadow-xl border-none">
                <CardHeader className="space-y-4 text-center pb-8 border-b bg-emerald-50/50 rounded-t-lg">
                    <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-serif text-emerald-900">Registration Successful!</CardTitle>
                        <p className="text-emerald-700 font-medium">Thank you for joining the National Institute of Caregivers</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-8 px-8">
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-secondary">Check your email</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We've sent a confirmation email to your registered address. It contains your temporary access details and instructions for the next steps.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-secondary">Verification Process</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Our registry team will review your uploaded documents. You will receive notification once your professional profile and NIC-ID are fully verified.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-center text-sm text-slate-600">
                        "Committed to excellence in caregiving standards across Nigeria."
                    </div>
                </CardContent>
                <CardFooter className="p-8 pt-0 flex flex-col gap-3">
                    <Button className="w-full bg-primary h-12 text-lg shadow-lg shadow-primary/20" asChild>
                        <Link href="/login">
                            Log in to Portal
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
