"use client"

import { useState, useEffect } from "react"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent")
        if (!consent) {
            setIsVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true")
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
            <div className="mx-auto max-w-4xl bg-white rounded-2xl border shadow-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-primary/10 p-4 rounded-full text-primary hidden md:block">
                    <Cookie className="h-8 w-8" />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-secondary mb-1 flex items-center justify-center md:justify-start gap-2">
                        <Cookie className="h-5 w-5 md:hidden" />
                        Quality & Compliance
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        We use cookies to enhance your professional experience and ensure our registry tools function correctly.
                        By continuing to use our platform, you agree to our <Link href="/regulatory/terms-and-privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={handleAccept}
                        className="bg-primary hover:bg-primary/90 text-white font-bold w-full md:w-auto"
                    >
                        Accept & Continue
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVisible(false)}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
