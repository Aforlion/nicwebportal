import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/env'

let client: ReturnType<typeof createBrowserClient> | undefined

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

    return client
}
