/**
 * Simple in-memory rate limiter for server-side actions.
 * Note: Since this is in-memory, it will reset on server restart
 * and only applies to the current server instance.
 */

class RateLimiter {
    private requests: Map<string, number[]>;
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs: number = 60000, maxRequests: number = 5) {
        this.requests = new Map();
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    /**
     * Checks if a request should be allowed for the given identifier.
     * @param identifier Typically an IP address or user ID.
     * @returns boolean true if allowed, false if limit exceeded.
     */
    async check(identifier: string): Promise<boolean> {
        const now = Date.now();
        const timestamps = this.requests.get(identifier) || [];

        // Remove expired timestamps
        const validTimestamps = timestamps.filter(t => now - t < this.windowMs);

        if (validTimestamps.length >= this.maxRequests) {
            return false;
        }

        validTimestamps.push(now);
        this.requests.set(identifier, validTimestamps);
        return true;
    }
}

// Export singleton instances for common use cases
export const authRateLimiter = new RateLimiter(60000, 5); // 5 attempts per minute
export const adminActionRateLimiter = new RateLimiter(60000, 10); // 10 admin actions per minute
