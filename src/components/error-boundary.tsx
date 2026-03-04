"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"

interface Props {
    children?: ReactNode
    fallback?: ReactNode
    className?: string
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div className={`p-6 rounded-xl border border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center text-center space-y-4 ${this.props.className}`}>
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg text-foreground">Something went wrong</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px]">
                            This component failed to load. Please try refreshing or contact support if the issue persists.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => this.setState({ hasError: false })}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Try again
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
