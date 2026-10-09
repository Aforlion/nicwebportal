"use client"

import React from "react"
import { cn } from "@/lib/utils"
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser'
import { StudentChartView } from "./student-chart-view"

interface RichTextProps {
    content: string
    className?: string
    invert?: boolean
}

// Known section headings that should be styled as prominent section headers
const SECTION_HEADINGS = new Set([
    "Lesson Overview",
    "Estimated Study Time",
    "Learning Objectives",
    "Core Instructional Content",
    "Nigerian Context & Workplace Realities",
    "Nigerian Context",
    "Workplace Realities",
    "Reflection & Applied Thinking",
    "Scenario Exercise",
    "Professional Analysis Questions",
    "Lesson Summary",
    "Key Takeaways",
    "Case Study",
    "Practical Application",
    "Review Questions",
    "Discussion Questions",
    "Assessment Instructions",
    "Introduction",
    "Background",
    "Module Overview",
    "Summary",
])

function isSectionHeading(line: string): boolean {
    const trimmed = line.trim()
    if (!trimmed) return false
    if (SECTION_HEADINGS.has(trimmed)) return true
    const words = trimmed.split(/\s+/)
    if (words.length <= 8 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && !trimmed.match(/^\d/)) return true
    if (trimmed.endsWith(':') && words.length <= 7) return true
    return false
}

function isMarkdownHeading(line: string) {
    if (line.startsWith("### ")) return { level: 3, text: line.slice(4) }
    if (line.startsWith("## ")) return { level: 2, text: line.slice(3) }
    if (line.startsWith("# ")) return { level: 1, text: line.slice(2) }
    return null
}

function isBulletItem(line: string) {
    return /^[•\-\*]\s+/.test(line.trim())
}

function isNumberedItem(line: string) {
    return /^\d+[\.\)]\s+/.test(line.trim())
}

function renderInline(text: string, invert?: boolean): React.ReactNode[] {
    // Match Markdown images ![alt](src), **bold**, _italic_
    const parts = text.split(/(!\[.*?\]\(.*?\)\s*|<audio[\s\S]*?<\/audio>\s*|\*\*.*?\*\*|_.*?_)/g)
    return parts.map((part, i) => {
        if (!part) return null

        // Markdown Image
        const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/)
        if (imgMatch) {
            const [, alt, src] = imgMatch
            return (
                <span key={i} className="block my-6">
                    <img
                        src={src}
                        alt={alt || "Lesson Visual Infographic"}
                        className="w-full h-auto rounded-2xl shadow-xl border border-slate-200/80 object-cover max-h-[480px]"
                    />
                </span>
            )
        }

        // HTML Audio Tag
        const audioMatch = part.match(/<audio[\s\S]*?src=["'](.*?)["'][\s\S]*?><\/audio>/)
        if (audioMatch) {
            const [, src] = audioMatch
            return (
                <div key={i} className="my-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Lesson Podcast Summary</span>
                            <p className="text-xs font-bold text-slate-700">Listen to Audio Explanation</p>
                        </div>
                    </div>
                    <audio controls src={src} className="w-full sm:w-72 h-10 accent-emerald-600" />
                </div>
            )
        }

        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className={cn("font-semibold", invert ? "text-white" : "text-slate-800")}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith("_") && part.endsWith("_")) {
            return <em key={i}>{part.slice(1, -1)}</em>
        }
        return part
    })
}

function cleanBullet(line: string) {
    return line.trim().replace(/^[•\-\*]\s+/, "")
}

function cleanNumbered(line: string) {
    return line.trim().replace(/^\d+[\.\)]\t?/, "").replace(/^\d+[\.\)]\s+/, "")
}

export function RichText({ content, className, invert }: RichTextProps) {
    if (!content) return null

    // Check if content is HTML (from Tiptap editor)
    const isHtml = /<[a-z][\s\S]*>/i.test(content) && !content.includes('<audio')

    if (isHtml) {
        const options: HTMLReactParserOptions = {
            replace: (domNode) => {
                if (domNode instanceof Element && domNode.name === 'chart-component') {
                    const type = domNode.attribs.type || 'bar'
                    const dataStr = domNode.attribs['data-data'] || '[]'
                    const title = domNode.attribs.title || ''
                    return <StudentChartView type={type} dataStr={dataStr} title={title} />
                }
            }
        }

        return (
            <div
                className={cn(
                    "prose prose-lg max-w-none",
                    invert ? "prose-invert" : "prose-slate",
                    "prose-headings:font-bold",
                    !invert && "prose-headings:text-slate-800",
                    "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
                    "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
                    "prose-p:leading-relaxed prose-p:my-4",
                    !invert && "prose-p:text-slate-700",
                    !invert && "prose-li:text-slate-700",
                    "prose-li:leading-relaxed",
                    !invert && "prose-strong:text-slate-800",
                    "prose-strong:font-semibold",
                    "prose-table:border-collapse prose-table:w-full",
                    "prose-td:border prose-td:border-border prose-td:p-3",
                    "prose-th:border prose-th:border-border prose-th:p-3 prose-th:bg-slate-50 prose-th:text-left",
                    "prose-img:rounded-xl prose-img:shadow-md prose-img:my-6",
                    className
                )}
            >
                {parse(content, options)}
            </div>
        )
    }

    // ─── Markdown / Custom Text Parser ────────────────────────────────────────────
    const rawLines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")

    const blocks: React.ReactNode[] = []
    let i = 0

    while (i < rawLines.length) {
        const rawLine = rawLines[i]
        const line = rawLine.trim()

        if (!line) { i++; continue }

        // Standalone Image Tag ![alt](src)
        const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/)
        if (imgMatch) {
            const [, alt, src] = imgMatch
            blocks.push(
                <div key={`img-${i}`} className="my-6">
                    <img
                        src={src}
                        alt={alt || "Lesson Visual Infographic"}
                        className="w-full h-auto rounded-2xl shadow-xl border border-slate-200/80 object-cover max-h-[500px]"
                    />
                </div>
            )
            i++; continue
        }

        // Standalone Audio Tag <audio ...></audio>
        const audioMatch = line.match(/^<audio[\s\S]*?src=["'](.*?)["'][\s\S]*?><\/audio>$/)
        if (audioMatch) {
            const [, src] = audioMatch
            blocks.push(
                <div key={`audio-${i}`} className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Audio Podcast Summary</span>
                            <p className="text-xs font-bold text-slate-800">Listen to Audio Explanation</p>
                        </div>
                    </div>
                    <audio controls src={src} className="w-full sm:w-72 h-10 accent-emerald-600" />
                </div>
            )
            i++; continue
        }

        // Markdown-style headings (## / ###)
        const mdHeading = isMarkdownHeading(line)
        if (mdHeading) {
            if (mdHeading.level === 2) {
                blocks.push(
                    <h2 key={i} className={cn("text-2xl font-bold mt-10 mb-4 pb-2 border-b", invert ? "text-white border-white/10" : "text-slate-800 border-slate-100")}>
                        {renderInline(mdHeading.text, invert)}
                    </h2>
                )
            } else {
                blocks.push(
                    <h3 key={i} className={cn("text-xl font-bold mt-8 mb-3", invert ? "text-white" : "text-slate-800")}>
                        {renderInline(mdHeading.text, invert)}
                    </h3>
                )
            }
            i++; continue
        }

        // Known section headings
        if (isSectionHeading(line)) {
            const nextNonBlank = rawLines.slice(i + 1).find(l => l.trim() !== "")?.trim()
            const isSimpleValue = nextNonBlank &&
                !isSectionHeading(nextNonBlank) &&
                !isBulletItem(nextNonBlank) &&
                !isNumberedItem(nextNonBlank) &&
                nextNonBlank.split(" ").length <= 6

            const isCallout = ["Lesson Overview", "Reflection & Applied Thinking", "Scenario Exercise",
                "Lesson Summary", "Key Takeaways", "Case Study"].includes(line)

            if (isCallout) {
                blocks.push(
                    <div key={`heading-${i}`} className="mt-10 mb-3 flex items-center gap-3">
                        <div className="h-0.5 w-6 bg-primary/40 rounded" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.15em]">{line}</span>
                        <div className="h-0.5 flex-1 bg-muted/60 rounded" />
                    </div>
                )
            } else if (isSimpleValue) {
                blocks.push(
                    <div key={`heading-${i}`} className="mt-8 mb-1 flex items-baseline gap-3">
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{line}:</span>
                        <span className="text-slate-700 font-medium">{nextNonBlank}</span>
                    </div>
                )
                i += 2
                while (i < rawLines.length && !rawLines[i].trim()) i++
                continue
            } else {
                blocks.push(
                    <h2 key={`heading-${i}`} className={cn("text-xl font-bold mt-10 mb-4 pb-2 border-b", invert ? "text-white border-white/10" : "text-slate-800 border-slate-100")}>
                        {line}
                    </h2>
                )
            }
            i++; continue
        }

        // Bullet list
        if (isBulletItem(line)) {
            const items: string[] = []
            while (i < rawLines.length && (isBulletItem(rawLines[i].trim()) || (!rawLines[i].trim() && items.length > 0 && i + 1 < rawLines.length && isBulletItem(rawLines[i + 1]?.trim())))) {
                if (rawLines[i].trim()) items.push(cleanBullet(rawLines[i]))
                i++
            }
            blocks.push(
                <ul key={`ul-${i}`} className="my-4 space-y-2 pl-2">
                    {items.map((item, j) => (
                        <li key={j} className={cn("flex items-start gap-3 leading-relaxed", invert ? "text-white/90" : "text-slate-700")}>
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{renderInline(item, invert)}</span>
                        </li>
                    ))}
                </ul>
            )
            continue
        }

        // Numbered list
        if (isNumberedItem(line)) {
            const items: string[] = []
            while (i < rawLines.length) {
                const cur = rawLines[i].trim()
                if (isNumberedItem(cur)) {
                    items.push(cleanNumbered(cur))
                    i++
                } else if (!cur && items.length > 0) {
                    i++
                } else {
                    break
                }
            }
            blocks.push(
                <ol key={`ol-${i}`} className="my-4 space-y-3 pl-2">
                    {items.map((item, j) => (
                        <li key={j} className={cn("flex items-start gap-3 leading-relaxed", invert ? "text-white/90" : "text-slate-700")}>
                            <span className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                {j + 1}
                            </span>
                            <span className="pt-0.5">{renderInline(item, invert)}</span>
                        </li>
                    ))}
                </ol>
            )
            continue
        }

        // Paragraph
        const paraLines: string[] = []
        while (i < rawLines.length) {
            const cur = rawLines[i].trim()
            if (!cur) { i++; break }
            if (isSectionHeading(cur) || isMarkdownHeading(cur) || isBulletItem(cur) || isNumberedItem(cur) || cur.startsWith("![") || cur.startsWith("<audio")) break
            paraLines.push(cur)
            i++
        }

        if (paraLines.length > 0) {
            const combined = paraLines.join(" ")
            blocks.push(
                <p key={`p-${i}`} className={cn("leading-[1.85] my-4 text-base", invert ? "text-white/90" : "text-slate-700")}>
                    {renderInline(combined, invert)}
                </p>
            )
        }
    }

    return (
        <div className={cn("max-w-none", !invert && "text-slate-700", className)}>
            {blocks}
        </div>
    )
}
