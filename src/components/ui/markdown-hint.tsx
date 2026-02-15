"use client"

import React from "react"
import { Info } from "lucide-react"

export function MarkdownHint() {
    return (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-[10px] sm:text-xs text-muted-foreground border border-dashed mt-2">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-primary shrink-0" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 w-full">
                <div className="flex items-center gap-1">
                    <span className="font-mono bg-background px-1 rounded border shadow-sm">**bold**</span>
                    <span>for bold</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-mono bg-background px-1 rounded border shadow-sm">###</span>
                    <span>for sub-heading</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-mono bg-background px-1 rounded border shadow-sm">- item</span>
                    <span>for bullet list</span>
                </div>
            </div>
        </div>
    )
}
