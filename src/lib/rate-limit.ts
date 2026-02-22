import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Persistent, distributed rate limiter backed by Upstash Redis.
 * Safe for serverless (Vercel) – survives cold starts and scales across instances.
 *
 * Key MUST always include an identity component (userId or IP) to avoid
 * cross-user interference (DoS) and to make limits meaningful per caller.
 *
 * Usage:
 *   const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
 *   const limited = await rateLimiter.auth.check(`login:${userId ?? ip}`)
 */

function buildRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
        // Dev fallback — log a warning; never silently fail in production
        if (process.env.NODE_ENV === 'production') {
            throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production.')
        }
        console.warn('[rate-limit] Upstash env vars not set. Rate limiting disabled in dev mode.')
        return null
    }

    return new Redis({ url, token })
}

const redis = buildRedis()

// Shared helper: returns a Ratelimit instance for a given window+limit, or a no-op if redis is unavailable.
function createLimiter(requests: number, windowSeconds: number) {
    if (!redis) {
        // Dev no-op: always allow
        return { limit: async (_key: string) => ({ success: true }) }
    }
    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
        analytics: false,
    })
}

// Pre-configured limiters for different contexts
const limiters = {
    // Authentication: 5 attempts per minute per user/IP (prevent brute force)
    auth: createLimiter(5, 60),
    // Admin mutations: 10 actions per minute per admin user
    admin: createLimiter(10, 60),
    // Assessment submissions: 3 per minute (prevent re-submission spam)
    assessment: createLimiter(3, 60),
    // General student actions: 20 per minute
    student: createLimiter(20, 60),
    // Email delivery: 2 per minute per IP (prevent email bombing/spam)
    email: createLimiter(2, 60),
}

export type LimiterName = keyof typeof limiters

/**
 * Check a rate limit.
 *
 * @param limiter  Which limiter to use ('auth' | 'admin' | 'assessment' | 'student')
 * @param identity A UNIQUE key combining action + user ID and/or IP.
 *                 Examples:
 *                   `login:${ip}`
 *                   `create-course:${userId}`
 *                   `submit-assessment:${userId}:${assessmentId}`
 * @returns true if the request is allowed, false if rate limited.
 */
export async function checkRateLimit(limiter: LimiterName, identity: string): Promise<boolean> {
    try {
        const result = await limiters[limiter].limit(identity)
        return result.success
    } catch (err) {
        // If Upstash is temporarily unavailable, fail-open (allow) but log for alerting
        console.error('[rate-limit] Upstash check failed — failing open:', err)
        return true
    }
}
