"use client"

import React from "react"
import { cn } from "@/lib/utils"
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser'
import { StudentChartView } from "./student-chart-view"

interface RichTextProps {
    content: string
    className?: string
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

// Heading patterns: lines that match known section headings OR are short ALL_CAPS lines
function isSectionHeading(line: string): boolean {
    const trimmed = line.trim()
    if (!trimmed) return false
    // Exact match in known set
    if (SECTION_HEADINGS.has(trimmed)) return true
    // Short all-caps line (max 8 words) — these are typically section titles written in CAPS
    const words = trimmed.split(/\s+/)
    if (words.length <= 8 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && !trimmed.match(/^\d/)) return true
    // Ends with a colon and is short
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

function renderInline(text: string): React.ReactNode[] {
    // Support **bold** and _italic_
    const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g)
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
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

export function RichText({ content, className }: RichTextProps) {
    if (!content) return null

    // Check if content is HTML (from Tiptap editor)
    const isHtml = /<[a-z][\s\S]*>/i.test(content)

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
                    "prose prose-slate prose-lg max-w-none",
                    "prose-headings:font-bold prose-headings:text-slate-800",
                    "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
                    "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
                    "prose-p:leading-relaxed prose-p:text-slate-700 prose-p:my-4",
                    "prose-li:leading-relaxed prose-li:text-slate-700",
                    "prose-strong:text-slate-800 prose-strong:font-semibold",
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

    // ─── Legacy Plain-Text Parser ────────────────────────────────────────────
    // Normalise CRLF → LF, split into individual lines
    const rawLines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")

    // Build a list of "blocks" to render
    const blocks: React.ReactNode[] = []
    let i = 0

    while (i < rawLines.length) {
        const rawLine = rawLines[i]
        const line = rawLine.trim()

        // Skip blank lines
        if (!line) { i++; continue }

        // ── Markdown-style headings (## / ###)
        const mdHeading = isMarkdownHeading(line)
        if (mdHeading) {
            if (mdHeading.level === 2) {
                blocks.push(
                    <h2 key={i} className="text-2xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-100">
                        {renderInline(mdHeading.text)}
                    </h2>
                )
            } else {
                blocks.push(
                    <h3 key={i} className="text-xl font-bold text-slate-800 mt-8 mb-3">
                        {renderInline(mdHeading.text)}
                    </h3>
                )
            }
            i++; continue
        }

        // ── Known / uppercase section headings
        if (isSectionHeading(line)) {
            // Peek: if next non-blank line looks like a sub-value (e.g. "60 minutes"), show inline
            const nextNonBlank = rawLines.slice(i + 1).find(l => l.trim() !== "")?.trim()
            const isSimpleValue = nextNonBlank &&
                !isSectionHeading(nextNonBlank) &&
                !isBulletItem(nextNonBlank) &&
                !isNumberedItem(nextNonBlank) &&
                nextNonBlank.split(" ").length <= 6

            // Special callout sections get a styled card
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
                // Skip the value line we've already consumed
                i += 2
                // skip blank lines after
                while (i < rawLines.length && !rawLines[i].trim()) i++
                continue
            } else {
                blocks.push(
                    <h2 key={`heading-${i}`} className="text-xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-100">
                        {line}
                    </h2>
                )
            }
            i++; continue
        }

        // ── Bullet list: collect consecutive bullet items
        if (isBulletItem(line)) {
            const items: string[] = []
            while (i < rawLines.length && (isBulletItem(rawLines[i].trim()) || (!rawLines[i].trim() && items.length > 0 && i + 1 < rawLines.length && isBulletItem(rawLines[i + 1]?.trim())))) {
                if (rawLines[i].trim()) items.push(cleanBullet(rawLines[i]))
                i++
            }
            blocks.push(
                <ul key={`ul-${i}`} className="my-4 space-y-2 pl-2">
                    {items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{renderInline(item)}</span>
                        </li>
                    ))}
                </ul>
            )
            continue
        }

        // ── Numbered list: collect consecutive numbered items
        if (isNumberedItem(line)) {
            const items: string[] = []
            let num = 1
            while (i < rawLines.length) {
                const cur = rawLines[i].trim()
                if (isNumberedItem(cur)) {
                    items.push(cleanNumbered(cur))
                    i++
                } else if (!cur && items.length > 0) {
                    // allow one blank line within a list
                    i++
                } else {
                    break
                }
            }
            blocks.push(
                <ol key={`ol-${i}`} className="my-4 space-y-3 pl-2">
                    {items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                            <span className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                {j + 1}
                            </span>
                            <span className="pt-0.5">{renderInline(item)}</span>
                        </li>
                    ))}
                </ol>
            )
            continue
        }

        // ── Default: paragraph — collect lines until a blank line or heading/list
        const paraLines: string[] = []
        while (i < rawLines.length) {
            const cur = rawLines[i].trim()
            if (!cur) { i++; break }
            if (isSectionHeading(cur) || isMarkdownHeading(cur) || isBulletItem(cur) || isNumberedItem(cur)) break
            paraLines.push(cur)
            i++
        }

        if (paraLines.length > 0) {
            const combined = paraLines.join(" ")
            blocks.push(
                <p key={`p-${i}`} className="text-slate-700 leading-[1.85] my-4 text-base">
                    {renderInline(combined)}
                </p>
            )
        }
    }

    return (
        <div className={cn("max-w-none text-slate-700", className)}>
            {blocks}
        </div>
    )
}
