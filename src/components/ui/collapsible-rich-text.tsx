"use client"

import React, { useState, useRef, useEffect } from "react"
import { RichText } from "./rich-text"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CollapsibleRichTextProps {
    content: string
    className?: string
    maxHeight?: number // px
}

export function CollapsibleRichText({ content, className, maxHeight = 150 }: CollapsibleRichTextProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [shouldShowButton, setShouldShowButton] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (contentRef.current) {
            setShouldShowButton(contentRef.current.scrollHeight > maxHeight)
        }
    }, [content, maxHeight])

    if (!content) return null

    return (
        <div className={cn("relative", className)}>
            <div
                ref={contentRef}
                style={{ maxHeight: isExpanded ? "none" : `${maxHeight}px` }}
                className={cn(
                    "overflow-hidden transition-all duration-300",
                    !isExpanded && shouldShowButton && "mask-bottom"
                )}
            >
                <RichText content={content} />
            </div>

            {shouldShowButton && (
                <div className={cn(
                    "flex justify-start mt-2",
                    !isExpanded && "pt-2"
                )}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 h-auto p-0 font-semibold flex items-center gap-1 bg-transparent hover:bg-transparent"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <>
                                Read Less <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Read More <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Gradient mask for collapsed state */}
            {!isExpanded && shouldShowButton && (
                <div className="absolute bottom-10 left-0 right-0 h-12 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
            )}
        </div>
    )
}
