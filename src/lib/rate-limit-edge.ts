/**
 * Edge-compatible rate limiter for Next.js Middleware.
 *
 * This module runs on the Vercel Edge Runtime (no Node.js APIs).
 * It uses the Upstash REST API directly via fetch() — the same
 * credentials as the server-side rate limiter but without the
 * @upstash/redis Node.js client.
 *
 * Strategy: Sliding window counter stored in Upstash Redis.
 * Each key tracks request counts per IP per time window.
 *
 * Defense layers:
 *   1. Middleware (this file)  — IP-level, blocks before rendering  ← strongest
 *   2. Action-level (rate-limit.ts) — per-user, inside server actions ← second layer
 */

export interface EdgeRateLimitConfig {
    /** Max requests allowed within the window */
    limit: number
    /** Window size in seconds */
    windowSeconds: number
}

// Per-route rate limit definitions.
// Routes not listed here are NOT rate-limited at the edge.
export const ROUTE_LIMITS: Record<string, EdgeRateLimitConfig> = {
    // Auth: strict — prevent brute force / credential stuffing
    '/auth':          { limit: 10,  windowSeconds: 60 },
    // API routes: moderate — allow legitimate API usage
    '/api':           { limit: 30,  windowSeconds: 60 },
    // Certificate issuance action: prevent spam issuance attempts
    '/portal/student/courses': { limit: 40, windowSeconds: 60 },
}

/**
 * Checks rate limit for a given IP and route prefix using Upstash REST API.
 * Safe for Vercel Edge Runtime (uses fetch, no Node.js APIs).
 *
 * @returns `{ allowed: boolean, remaining: number, resetAt: number }`
 *          If Upstash is unavailable, fails-open (allowed = true).
 */
export async function checkEdgeRateLimit(
    ip: string,
    matchedRoute: string
): Promise<{ allowed: boolean; remaining: number }> {
    const url   = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    const config = ROUTE_LIMITS[matchedRoute]

    // If no config for this route, always allow
    if (!config) return { allowed: true, remaining: -1 }

    // If Redis not configured, fail-open with a warning
    if (!url || !token) {
        console.error('[edge-rate-limit] Upstash env vars missing — rate limiting disabled at edge.')
        return { allowed: true, remaining: -1 }
    }

    const key = `rl:edge:${matchedRoute}:${ip}`
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - config.windowSeconds

    try {
        // Use Upstash sorted set for sliding window:
        // 1. Remove entries outside the current window
        // 2. Add current request with current timestamp as score
        // 3. Count total entries in the window
        const pipeline = [
            ['ZREMRANGEBYSCORE', key, '-inf', windowStart.toString()],
            ['ZADD', key, now.toString(), `${now}-${Math.random()}`],
            ['ZCARD', key],
            ['EXPIRE', key, config.windowSeconds.toString()],
        ]

        const response = await fetch(`${url}/pipeline`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pipeline),
        })

        if (!response.ok) {
            // Upstash error — fail-open
            console.error(`[edge-rate-limit] Upstash pipeline failed: ${response.status}`)
            return { allowed: true, remaining: -1 }
        }

        const results = await response.json() as Array<{ result: number }>
        const count = results[2]?.result ?? 0
        const allowed = count <= config.limit
        const remaining = Math.max(0, config.limit - count)

        return { allowed, remaining }
    } catch (err) {
        // Network error or parse failure — fail-open, never crash middleware
        console.error('[edge-rate-limit] Unexpected error — failing open:', err)
        return { allowed: true, remaining: -1 }
    }
}

/**
 * Finds the matching rate-limit config key for a given pathname.
 * Returns the most specific match.
 */
export function matchRateLimitRoute(pathname: string): string | null {
    // Sort keys by specificity (longer prefix = more specific)
    const sortedKeys = Object.keys(ROUTE_LIMITS).sort((a, b) => b.length - a.length)
    return sortedKeys.find(prefix => pathname.startsWith(prefix)) ?? null
}
