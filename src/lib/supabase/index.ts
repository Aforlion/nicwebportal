import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/env'

let client: ReturnType<typeof createBrowserClient> | undefined
let authListenerRegistered = false

/**
 * Wipes all Supabase auth keys from localStorage.
 * Called when a token refresh fails so stale tokens never persist.
 */
function clearSupabaseStorage() {
    try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            // Supabase auth keys follow the pattern: sb-<project-ref>-auth-token
            if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
    } catch {
        // localStorage may be unavailable in some environments — safe to ignore
    }
}

export const createClient = () => {
    if (typeof window === 'undefined') {
        return createBrowserClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
    }

    if (!client) {
        client = createBrowserClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
    }

    // Register once: listen for auth failures and aggressively clear stale tokens.
    // This fires before any component mounts, stopping the refresh loop at its source.
    if (!authListenerRegistered) {
        authListenerRegistered = true
        client.auth.onAuthStateChange((event: string) => {
            if (event === 'SIGNED_OUT') {
                clearSupabaseStorage()
            }
        })
    }

    return client
}
