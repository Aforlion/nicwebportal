import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkEdgeRateLimit, matchRateLimitRoute } from '@/lib/rate-limit-edge'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // --- Layer 1: Edge Rate Limiting ---
    // Runs before session resolution so bad actors are blocked
    // before any Supabase or DB work happens.
    const matchedRoute = matchRateLimitRoute(pathname)
    if (matchedRoute) {
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            request.headers.get('x-real-ip') ??
            'unknown'

        const { allowed, remaining } = await checkEdgeRateLimit(ip, matchedRoute)

        if (!allowed) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: {
                    'Retry-After': '60',
                    'X-RateLimit-Remaining': remaining.toString(),
                    'Content-Type': 'text/plain',
                },
            })
        }
    }

    // --- Layer 2: Supabase Session Management ---
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
