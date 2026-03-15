"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface AutoLogoutProps {
    timeoutMinutes: number
}

export function AutoLogout({ timeoutMinutes }: AutoLogoutProps) {
    const router = useRouter()
    const supabase = createClient()
    const lastActivityRef = useRef<number>(Date.now())
    const timeoutMs = timeoutMinutes * 60 * 1000

    const checkInactivity = useCallback(async () => {
        const now = Date.now()
        if (now - lastActivityRef.current >= timeoutMs) {
            // User exceeded inactivity timeout
            const { error } = await supabase.auth.signOut()
            if (!error) {
                // Clear any local storage/session storage if needed, then redirect
                router.push("/login?expired=true")
                // Toast will be handled on the login page based on query param, 
                // but we can also fire one immediately before navigation.
            } else {
                console.error("Error signing out due to inactivity:", error)
            }
        }
    }, [supabase.auth, timeoutMs, router])

    useEffect(() => {
        const updateActivity = () => {
            lastActivityRef.current = Date.now()
        }

        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "wheel"
        ]

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, updateActivity, { passive: true })
        })

        // Check for inactivity every minute
        const intervalId = setInterval(checkInactivity, 60 * 1000)

        return () => {
            // Cleanup event listeners
            events.forEach(event => {
                window.removeEventListener(event, updateActivity)
            })
            clearInterval(intervalId)
        }
    }, [checkInactivity])

    // This is a logic-only component rendering nothing
    return null
}
