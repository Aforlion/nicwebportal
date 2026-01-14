"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, GraduationCap, Search } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background py-20 pb-20 md:py-32 md:pb-32">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-accent/20 blur-[120px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="mb-6 inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            The Official Regulatory Body for Caregivers
                        </div>
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-secondary md:text-5xlg lg:text-6xl">
                            Professionalizing <span className="text-primary">Care</span> across Nigeria
                        </h1>
                        <p className="mb-8 max-w-[600px] text-lg text-muted-foreground md:text-xl">
                            The National Institute of Caregivers (NIC) is dedicated to training, certifying, and regulating care professionals to ensure excellence and safety in the care industry.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button size="lg" className="h-12 bg-primary px-8 text-white hover:bg-primary/90" asChild>
                                <Link href="/programs">
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    Enrol Now
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 border-2 px-8" asChild>
                                <Link href="/verify">
                                    <Search className="mr-2 h-5 w-5" />
                                    Verify a Caregiver
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="hidden lg:block"
                    >
                        <div className="relative rounded-2xl border bg-white p-2 shadow-2xl">
                            <div className="overflow-hidden rounded-xl bg-muted/20 p-8">
                                {/* Visual Placeholder for institutional feeling */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ShieldCheck className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-secondary">National Registry</h4>
                                            <p className="text-xs text-muted-foreground">Certified professionals only</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm ml-12">
                                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                                            <GraduationCap className="h-6 w-6 text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-secondary">Expert Certification</h4>
                                            <p className="text-xs text-muted-foreground">HCA & Specialty Care</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm ml-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Search className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-secondary">Public Verification</h4>
                                            <p className="text-xs text-muted-foreground">Instant credential check</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
