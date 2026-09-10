'use client'

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function Footer() {
    const [newsletterEmail, setNewsletterEmail] = useState("")
    const [subscribed, setSubscribed] = useState(false)

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newsletterEmail || !newsletterEmail.includes("@")) {
            toast.error("Please enter a valid email address.")
            return
        }
        setSubscribed(true)
        toast.success("Thank you for subscribing to the NIC Newsletter!")
        setNewsletterEmail("")
    }

    return (
        <footer className="border-t bg-slate-950 text-slate-100">
            <div className="container mx-auto px-4 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <Image
                                src="/logo.jpg"
                                alt="NIC Logo"
                                width={32}
                                height={32}
                                className="h-8 w-auto rounded bg-white p-0.5 group-hover:scale-105 transition-transform"
                            />
                            <span className="text-2xl font-bold tracking-tighter text-white">NIC</span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            The National Institute of Caregivers (NIC) is Nigeria&apos;s leading professional body for caregiving training, regulation, and advocacy.
                        </p>
                        <div className="flex space-x-4 pt-1">
                            <a href="https://facebook.com/nicnaija" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-amber-400 transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="https://x.com/nicnaija" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-400 hover:text-amber-400 transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="https://instagram.com/NICNigeria" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-amber-400 transition-colors"><Instagram className="h-5 w-5" /></a>
                            <a href="https://linkedin.com/company/nicnigeria" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 hover:text-amber-400 transition-colors"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-6 text-base font-bold uppercase tracking-wider text-white">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
                            <li><Link href="/programs" className="hover:text-amber-400 transition-colors">Training Programs</Link></li>
                            <li><Link href="/membership" className="hover:text-amber-400 transition-colors">Membership</Link></li>
                            <li><Link href="/news" className="hover:text-amber-400 transition-colors">News & Events</Link></li>
                            <li><Link href="/gallery" className="hover:text-amber-400 transition-colors">Media Gallery</Link></li>
                            <li><Link href="/advocacy" className="hover:text-amber-400 transition-colors">Advocacy & Research</Link></li>
                            <li><Link href="/verify" className="hover:text-amber-400 transition-colors">Verify Caregiver</Link></li>
                            <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-base font-bold uppercase tracking-wider text-white">Contact Info</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 text-amber-400 mt-1 flex-shrink-0" />
                                <span className="text-xs leading-normal">Suit S9, 2nd Floor, Ocean Center, Gudu District, FCT, Abuja.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                <a href="tel:+2348034753055" className="hover:text-amber-400 transition-colors font-mono">
                                    08034753055
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                <a href="mailto:info@nicnigeria.org" className="hover:text-amber-400 transition-colors">
                                    info@nicnigeria.org
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-base font-bold uppercase tracking-wider text-white">Regulatory</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/regulatory/regulatory-framework" className="hover:text-amber-400 transition-colors">Regulatory Framework</Link></li>
                            <li><Link href="/regulatory/code-of-ethics-facility" className="hover:text-amber-400 transition-colors">Code of Ethics</Link></li>
                            <li><Link href="/regulatory/terms-and-privacy" className="hover:text-amber-400 transition-colors">Terms & Privacy</Link></li>
                            <li><Link href="/regulatory" className="hover:text-amber-400 transition-colors">All Frameworks</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-base font-bold uppercase tracking-wider text-white">Newsletter</h3>
                        <p className="mb-4 text-sm text-slate-400 leading-relaxed">Stay updated with the latest in caregiving standard updates and announcements.</p>
                        
                        {subscribed ? (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2 font-medium">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>Subscribed successfully!</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="space-y-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                />
                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Subscribe to Newsletter</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="mt-16 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} National Institute of Caregivers (NIC Nigeria). All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    )
}

