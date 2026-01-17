"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Calendar, ArrowLeft, Printer, Download, List, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PolicyViewerProps {
    title: string
    content: string
    category: string
    lastUpdated?: string
}

interface Section {
    id: string
    title: string
    level: number
}

export function PolicyViewer({ title, content, category, lastUpdated }: PolicyViewerProps) {
    const [sections, setSections] = useState<Section[]>([])

    // Parse the content for headings to build TOC
    useEffect(() => {
        const lines = content.split('\n')
        const foundSections: Section[] = []
        lines.forEach((line, index) => {
            if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
                const level = line.split(' ')[0].length
                const headingTitle = line.replace(/^#+\s+/, '').replace(/\*/g, '')
                const id = headingTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                foundSections.push({ id: id + '-' + index, title: headingTitle, level })
            }
        })
        setSections(foundSections)
    }, [content])

    const paragraphs = content.split('\n').filter(p => p.trim() !== '')

    // Helper to render table
    const renderTable = (startIndex: number) => {
        const rows = []
        let i = startIndex
        while (i < paragraphs.length && paragraphs[i].includes('|')) {
            const cells = paragraphs[i].split('|').filter(c => c.trim() !== '' || paragraphs[i].startsWith('|')).map(c => c.trim())
            if (cells.length > 0 && !paragraphs[i].includes('---')) {
                rows.push(cells)
            }
            i++
        }

        return {
            element: (
                <div className="my-8 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-secondary font-black border-b border-slate-200 text-xs">
                            <tr>
                                {rows[0]?.map((cell, idx) => (
                                    <th key={idx} className="px-6 py-4">{cell}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.slice(1).map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    {row.map((cell, cidx) => (
                                        <td key={cidx} className="px-6 py-4 text-slate-600 font-medium">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ),
            endIndex: i - 1
        }
    }

    const renderedParagraphs = []
    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i]

        // Handle Tables
        if (p.includes('|') && paragraphs[i + 1]?.includes('|--')) {
            const { element, endIndex } = renderTable(i)
            renderedParagraphs.push(element)
            i = endIndex
            continue
        }

        const section = sections.find(s => s.id.endsWith(`-${i}`))
        const id = section?.id

        // Handle Headings & Content
        if (p.startsWith('# ')) {
            renderedParagraphs.push(<h1 key={i} id={id} className="scroll-mt-32 pt-12 first:pt-0 text-3xl font-black mb-8 border-b-4 border-primary/20 pb-4 text-secondary leading-tight uppercase tracking-tight">{p.replace('# ', '').replace(/\*/g, '')}</h1>)
        } else if (p.startsWith('## ')) {
            renderedParagraphs.push(<h2 key={i} id={id} className="scroll-mt-32 pt-16 text-2xl font-black mt-12 mb-6 flex items-center gap-3 text-secondary">
                <span className="h-6 w-1 bg-primary rounded-full"></span>
                {p.replace('## ', '').replace(/\*/g, '')}
            </h2>)
        } else if (p.startsWith('### ')) {
            renderedParagraphs.push(<h3 key={i} id={id} className="scroll-mt-32 pt-8 text-xl font-bold mt-8 mb-4 text-secondary/80 italic">{p.replace('### ', '').replace(/\*/g, '')}</h3>)
        } else if (p.startsWith('* ') || p.startsWith('- ')) {
            renderedParagraphs.push(<div key={i} className="flex gap-4 mb-3 ml-4">
                <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-slate-600 text-lg leading-relaxed m-0 font-medium">{p.replace(/^[*-]\s+/, '')}</p>
            </div>)
        } else if (/^\d+\.\s/.test(p)) {
            renderedParagraphs.push(<div key={i} className="flex gap-4 mb-5 ml-0 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
                <span className="text-primary font-black text-xl shrink-0 w-8">{p.split('.')[0]}.</span>
                <p className="text-slate-700 text-lg leading-relaxed m-0 font-bold">{p.replace(/^\d+\.\s+/, '')}</p>
            </div>)
        } else if (p.startsWith('**Effective Date:**') || p.startsWith('**Issued by:**') || p.startsWith('**Policy Number:**')) {
            renderedParagraphs.push(<div key={i} className="bg-slate-50 p-6 rounded-2xl border-l-4 border-primary mb-10 text-sm font-bold text-secondary/70 flex flex-col gap-1 shadow-sm">
                {p.replace(/\*\*/g, '').split(':').map((part, idx) => (
                    <span key={idx}>{idx === 0 ? <span className="uppercase tracking-widest text-[10px] block opacity-60 mb-1">{part}</span> : part}</span>
                ))}
            </div>)
        } else if (p.startsWith('### ©') || p.includes('Rights Reserved')) {
            renderedParagraphs.push(<div key={i} className="mt-20 pt-8 border-t text-center text-slate-400 text-sm italic font-medium">
                {p.replace('### ', '')}
            </div>)
        } else if (p === '---') {
            renderedParagraphs.push(<hr key={i} className="my-16 border-slate-100" />)
        } else {
            renderedParagraphs.push(<p key={i} className="text-slate-600 text-lg leading-relaxed mb-6 font-medium tracking-tight whitespace-pre-wrap">{p}</p>)
        }
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Meta Bar */}
            <div className="border-b bg-white/80 backdrop-blur sticky top-16 z-30">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-primary transition-colors">
                            <Link href="/regulatory">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline font-bold">All Frameworks</span>
                            </Link>
                        </Button>
                        <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{category}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto font-bold">
                        <Button variant="outline" size="sm" onClick={() => window.print()} className="flex-1 md:flex-none border-2 hover:bg-slate-50">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button size="sm" className="flex-1 md:flex-none bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/20">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Table of Contents - Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-36 h-fit">
                        <div>
                            <div className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest mb-6 opacity-60">
                                <List className="h-4 w-4" />
                                Table of Contents
                            </div>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className={`
                                            group flex items-center py-2.5 px-4 text-sm transition-all rounded-xl
                                            ${section.level === 1 ? 'font-bold text-secondary bg-slate-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-primary'}
                                            ${section.level >= 3 ? 'pl-8 text-xs' : ''}
                                        `}
                                    >
                                        <ChevronRight className={`h-3 w-3 shrink-0 mr-2 transition-transform ${section.level === 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                                        {section.title}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        <div className="pt-8">
                            <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20">
                                <p className="text-xs font-black text-primary uppercase mb-3 tracking-widest">Regulatory Scope</p>
                                <p className="text-sm text-slate-700 font-bold leading-relaxed m-0">
                                    Enforceable standards for all NIC members and institutional partners in Nigeria.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3">
                        <div className="bg-white lg:p-16 rounded-[3rem] lg:border-2 lg:shadow-2xl shadow-slate-200/50">
                            {/* Document Title Section */}
                            <div className="mb-16">
                                <h1 className="text-4xl md:text-6xl font-black text-secondary leading-[1.1] mb-8 tracking-tighter">
                                    {title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Official Release: 2026
                                    </div>
                                    <div className="text-slate-300 font-light text-xl">|</div>
                                    <div className="text-sm text-slate-400 font-bold font-mono">
                                        REF: NIC/GOV/{category.substring(0, 3).toUpperCase()}/V1
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {renderedParagraphs}
                            </div>
                        </div>

                        {/* Pagination / Next Steps */}
                        <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-8 p-12 bg-secondary rounded-[3.5rem] text-white shadow-2xl shadow-secondary/30 relative overflow-hidden group">
                            <div className="relative z-10 text-center md:text-left max-w-lg">
                                <h4 className="text-3xl font-black mb-3 tracking-tight">Need Support with Compliance?</h4>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                    Our registry department provides technical guidance for facilities to meet these national standards.
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <Button className="bg-primary hover:bg-primary/90 text-white font-black px-10 h-16 rounded-2xl text-lg shadow-xl shadow-primary/20" asChild>
                                    <Link href="/join/facility">Institutional Enrolment</Link>
                                </Button>
                                <Button variant="outline" className="border-2 text-white hover:bg-white/10 px-10 h-16 rounded-2xl text-lg" asChild>
                                    <Link href="/contact">Legal Support</Link>
                                </Button>
                            </div>
                            {/* Decorative vector */}
                            <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 skew-x-12 group-hover:translate-x-4 transition-transform duration-1000"></div>
                        </div>
                    </main>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    nav, aside, button, header, .no-print, [role="banner"] {
                        display: none !important;
                    }
                    .container {
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    main {
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                    }
                    div[id] {
                        page-break-before: always;
                    }
                    h1, h2, h3 {
                        page-break-after: avoid;
                    }
                    p, div, li {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    )
}
