'use client'

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, Send, Facebook, Twitter, Instagram, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage() {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!fullName.trim()) {
            toast.error("Please enter your full name.")
            return
        }
        if (!email.trim() || !email.includes("@")) {
            toast.error("Please enter a valid email address.")
            return
        }
        if (!message.trim()) {
            toast.error("Please enter your message.")
            return
        }

        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setSubmitted(true)
            toast.success("Message sent successfully! Our team will get back to you shortly.")
        }, 600)
    }

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

                            {submitted ? (
                                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                                    <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
                                    <p className="text-slate-600">Your message has been received. We have dispatched a confirmation to <strong>{email}</strong>.</p>
                                    <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-4">
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Full Name <span className="text-rose-500">*</span></label>
                                            <Input
                                                placeholder="e.g. Florence Sunmola"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address <span className="text-rose-500">*</span></label>
                                            <Input
                                                type="email"
                                                placeholder="e.g. florence@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input
                                            placeholder="How can we help?"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message <span className="text-rose-500">*</span></label>
                                        <textarea
                                            className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Provide details about your enquiry..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full bg-primary py-6 text-lg" size="lg">
                                        <Send className="mr-2 h-5 w-5" />
                                        {loading ? "Sending Message..." : "Send Message"}
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info & Office */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-secondary">Office Location</h2>

                            <Card className="border-none bg-muted/30 shadow-none">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">Headquarters</h3>
                                            <p className="text-muted-foreground">Suit S9, 2nd Floor, Ocean Center, Gudu District, FCT, Abuja.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent flex-shrink-0">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">Phone Support</h3>
                                            <p className="text-muted-foreground">
                                                <a href="tel:+2348034753055" className="hover:text-primary transition-colors font-mono">08034753055</a>
                                            </p>
                                            <p className="text-muted-foreground">
                                                <a href="tel:+2348130289626" className="hover:text-primary transition-colors font-mono">(+234) 813 028 9626</a>
                                            </p>
                                            <p className="text-sm text-muted-foreground italic">Available Mon-Fri, 9am - 5pm</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 flex-shrink-0">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">Email Enquiries</h3>
                                            <p className="text-muted-foreground">
                                                <a href="mailto:info@nicnigeria.org" className="hover:text-primary transition-colors">info@nicnigeria.org</a>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
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
                                    Interested in partnering with the National Institute of Caregivers? Please send a formal proposal to{" "}
                                    <a href="mailto:info@nicnigeria.org" className="font-medium text-primary hover:underline">
                                        info@nicnigeria.org
                                    </a>
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-primary/5 p-8">
                                <h3 className="mb-4 font-bold text-secondary">Follow Our Community</h3>
                                <div className="flex gap-4">
                                    <Link href="https://facebook.com/nicnaija" target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-primary transition-colors text-slate-600">
                                        <Facebook className="h-5 w-5" />
                                    </Link>
                                    <Link href="https://x.com/nicnaija" target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-primary transition-colors text-slate-600">
                                        <Twitter className="h-5 w-5" />
                                    </Link>
                                    <Link href="https://instagram.com/NICNigeria" target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-primary transition-colors text-slate-600">
                                        <Instagram className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

