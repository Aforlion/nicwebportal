import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Contact Us
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Have questions about our programs, membership, or verification? Our team is here to help you.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Form */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold text-secondary">Send us a Message</h2>
                                <p className="mt-2 text-muted-foreground">Fill out the form below and we will get back to you within 24-48 hours.</p>
                            </div>
                            <form className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input type="email" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject</label>
                                    <Input placeholder="How can we help?" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <textarea
                                        className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Provide details about your enquiry..."
                                    />
                                </div>
                                <Button className="w-full bg-primary py-6 text-lg" size="lg">
                                    <Send className="mr-2 h-5 w-5" />
                                    Send Message
                                </Button>
                            </form>
                        </div>

                        {/* Contact Info & Office */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-secondary">Office Location</h2>

                            <Card className="border-none bg-muted/30 shadow-none">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">Headquarters</h3>
                                            <p className="text-muted-foreground">Abuja Business District, FCT, Nigeria</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">Phone Support</h3>
                                            <p className="text-muted-foreground">+234 (0) 000 0000 000</p>
                                            <p className="text-sm text-muted-foreground italic">Available Mon-Fri, 9am - 5pm</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">Email Enquiries</h3>
                                            <p className="text-muted-foreground">info@nic.org.ng</p>
                                            <p className="text-muted-foreground">support@nic.org.ng</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">Working Hours</h3>
                                            <p className="text-muted-foreground">Mon - Fri: 9:00 AM - 5:00 PM</p>
                                            <p className="text-muted-foreground">Sat - Sun: Closed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="rounded-2xl border bg-accent/5 p-8">
                                <h3 className="mb-2 font-bold text-secondary">Partnership Enquiries</h3>
                                <p className="text-sm text-muted-foreground">
                                    Interested in partnering with the National Institute of Caregivers? Please send a formal proposal to <span className="font-medium text-primary">partnerships@nic.org.ng</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
