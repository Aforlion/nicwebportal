"use client"

import { ShieldCheck, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PolicyViewerProps {
    title: string
    content: string
    category: string
    lastUpdated?: string
}

export function PolicyViewer({ title, content, category, lastUpdated }: PolicyViewerProps) {
    // Basic parser for the text documents
    const paragraphs = content.split('\n').filter(p => p.trim() !== '')

    return (
        <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/regulatory">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Frameworks
                    </Link>
                </Button>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">{category}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-secondary sm:text-5xl">{title}</h1>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Last Updated: {lastUpdated || 'January 2026'}
                    </div>
                </div>
            </div>

            <div className="prose prose-slate max-w-none prose-headings:text-secondary prose-a:text-primary">
                <div className="bg-white p-8 sm:p-12 rounded-2xl border shadow-sm space-y-6">
                    {paragraphs.map((p, i) => {
                        // Check if it's a heading
                        if (p.startsWith('## ')) {
                            return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 border-b pb-2">{p.replace('## ', '')}</h2>
                        }
                        if (p.startsWith('# ')) {
                            return <h2 key={i} className="text-3xl font-bold mt-10 mb-6">{p.replace('# ', '')}</h2>
                        }
                        if (p.startsWith('### ')) {
                            return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{p.replace('### ', '')}</h3>
                        }
                        // Check if it's a bullet point
                        if (p.startsWith('* ')) {
                            return <li key={i} className="ml-6 list-disc text-slate-600 leading-relaxed py-1">{p.replace('* ', '')}</li>
                        }
                        if (p.startsWith('- ')) {
                            return <li key={i} className="ml-6 list-disc text-slate-600 leading-relaxed py-1">{p.replace('- ', '')}</li>
                        }
                        // Check if it's a horizontal rule
                        if (p === '---') {
                            return <hr key={i} className="my-8 border-slate-200" />
                        }

                        // Default paragraph
                        return <p key={i} className="text-slate-600 leading-relaxed whitespace-pre-wrap">{p}</p>
                    })}
                </div>
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200 italic text-sm text-slate-500">
                <p>
                    Disclaimer: This document is part of the official regulatory framework of the National Institute of Caregivers (NIC).
                    It is intended to provide clarity on standards, expectations, and legal obligations within the NIC network in Nigeria.
                </p>
            </div>
        </div>
    )
}
