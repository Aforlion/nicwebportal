import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/logo.jpg"
                                alt="NIC Logo"
                                width={32}
                                height={32}
                                className="h-8 w-auto rounded bg-white p-0.5"
                            />
                            <span className="text-2xl font-bold tracking-tighter text-white">NIC</span>
                        </Link>
                        <p className="text-sm text-slate-400">
                            The National Institute of Caregivers (NIC) is Nigeria&apos;s leading professional body for caregiving training, regulation, and advocacy.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="hover:text-accent transition-colors"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-accent transition-colors"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-accent transition-colors"><Linkedin className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-6 text-lg font-bold text-white">Quick Links</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/programs" className="hover:text-white transition-colors">Training Programs</Link></li>
                            <li><Link href="/membership" className="hover:text-white transition-colors">Membership</Link></li>
                            <li><Link href="/verify" className="hover:text-white transition-colors">Verify Caregiver</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-lg font-bold text-white">Contact Info</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                                <span className="text-xs">Suit S9, 2nd Floor, Ocean Center, Gudu District, FCT, Abuja.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-accent" />
                                08034753055
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-accent" />
                                info@nicnigeria.com
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-lg font-bold text-white">Regulatory</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/regulatory/regulatory-framework" className="hover:text-white transition-colors">Regulatory Framework</Link></li>
                            <li><Link href="/regulatory/code-of-ethics-facility" className="hover:text-white transition-colors">Code of Ethics</Link></li>
                            <li><Link href="/regulatory/terms-and-privacy" className="hover:text-white transition-colors">Terms & Privacy</Link></li>
                            <li><Link href="/regulatory" className="hover:text-white transition-colors">All Frameworks</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-lg font-bold text-white">Newsletter</h3>
                        <p className="mb-4 text-sm text-slate-400">Stay updated with the latest in the caregiving industry.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                            <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-secondary hover:bg-accent/90 transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} National Institute of Caregivers (NIC). All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    )
}
