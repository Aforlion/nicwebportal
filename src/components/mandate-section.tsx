"use client"

import { motion } from "framer-motion"
import { GraduationCap, ShieldCheck, Megaphone, Activity } from "lucide-react"

const mandates = [
    {
        title: "Training & Education",
        description: "Providing world-class technical training for various caregiving specialties, including HCA and Dementia care.",
        icon: GraduationCap,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        title: "Regulation & Standards",
        description: "Setting national standards and conducting inspections to ensure safety and quality in care facilities.",
        icon: ShieldCheck,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Advocacy & Voice",
        description: "Speaking for caregivers at the national level and influencing policy for the Nigerian care industry.",
        icon: Megaphone,
        color: "text-accent",
        bg: "bg-accent/10",
    },
    {
        title: "Professional Growth",
        description: "Support for career development through CPD, certification, and professional membership networks.",
        icon: Activity,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
]

export function MandateSection() {
    return (
        <section className="bg-muted/30 py-24">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                        Our Core Mandate
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        The National Institute of Caregivers operates under a clear framework to elevate the standard of care in Nigeria.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {mandates.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="rounded-2xl border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className={`${item.bg} mb-6 flex h-14 w-14 items-center justify-center rounded-xl`}>
                                <item.icon className={`h-8 w-8 ${item.color}`} />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-secondary">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
