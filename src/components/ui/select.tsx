"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => (
        <div className="relative">
            <select
                ref={ref}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
        </div>
    )
)
Select.displayName = "Select"

// Simplified components for compatibility
const SelectTrigger = ({ children, className, ...props }: any) => (
    <div className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm", className)} {...props}>
        {children}
    </div>
)

const SelectValue = ({ placeholder, children }: any) => (
    <span className="text-muted-foreground">{children || placeholder}</span>
)

const SelectContent = ({ children }: any) => children

const SelectItem = ({ value, children }: any) => (
    <option value={value}>{children}</option>
)

const SelectGroup = ({ children }: any) => children

export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectGroup,
}
