"use client"

import React from "react"
import { cn } from "@/lib/utils"
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser'
import { StudentChartView } from "./student-chart-view"

interface RichTextProps {
    content: string
    className?: string
}

export function RichText({ content, className }: RichTextProps) {
    if (!content) return null

    // Check if content is HTML (from new Tiptap editor) or legacy Markdown string
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
                    "prose prose-sm sm:prose-base dark:prose-invert max-w-none text-balanced",
                    // Table styles for Tiptap
                    "prose-table:border-collapse prose-table:w-full prose-table:m-0 border-border",
                    "prose-td:border prose-td:border-border prose-td:p-2",
                    "prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted prose-th:text-left",
                    "prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto",
                    className
                )}
            >
                {parse(content, options)}
            </div>
        )
    }

    // Legacy parser for existing plain text / markdown content
    // 1. Split into paragraphs by double newlines
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() !== "")

    return (
        <div className={cn("space-y-4 text-balanced prose prose-sm sm:prose-base dark:prose-invert max-w-none", className)}>
            {paragraphs.map((para, i) => {
                // Handle headings
                if (para.startsWith("### ")) {
                    return <h3 key={i} className="text-xl font-bold mt-6 mb-2">{renderInline(para.slice(4))}</h3>
                }
                if (para.startsWith("## ")) {
                    return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{renderInline(para.slice(3))}</h2>
                }

                // Handle basic list items
                if (para.startsWith("- ") || para.startsWith("* ") || para.includes("\n- ") || para.includes("\n* ")) {
                    const items = para.split(/\n(?=[- *] )/).filter(item => item.trim() !== "")
                    return (
                        <ul key={i} className="list-disc pl-6 space-y-2 my-4">
                            {items.map((item, j) => (
                                <li key={j} className="leading-relaxed">
                                    {renderInline(item.replace(/^[- *]\s*/, ""))}
                                </li>
                            ))}
                        </ul>
                    )
                }

                // Default paragraph
                return (
                    <p key={i} className="leading-relaxed whitespace-pre-line">
                        {renderInline(para)}
                    </p>
                )
            })}
        </div>
    )
}

function renderInline(text: string) {
    // Basic inline formatting (Bold only for now to keep it simple and safe)
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
        }
        return part
    })
}
