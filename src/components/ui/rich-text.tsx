"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface RichTextProps {
    content: string
    className?: string
}

export function RichText({ content, className }: RichTextProps) {
    if (!content) return null

    // Simple parser for basic formatting
    // 1. Split into paragraphs by double newlines
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() !== "")

    return (
        <div className={cn("space-y-4 text-balanced", className)}>
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
