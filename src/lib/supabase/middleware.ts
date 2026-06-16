import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/env'

// ============================================================
//  Route-Specific RBAC Configuration
// ============================================================
//
//  Each entry defines:
//    - pathPrefix: the route prefix to match
//    - allowedRoles: roles permitted on this prefix
//
//  Rules are evaluated in ORDER — first match wins.
//  Add new protected route groups here; do NOT add roles to a global array.
//
// const ROUTE_RBAC: { pathPrefix: string; allowedRoles: string[] }[] = [
//     // Training management — instructors can access alongside admins
//     {
//         pathPrefix: '/admin/training',
//         allowedRoles: ['admin', 'super_admin', 'instructor'],
//     },
//     // Registry / facility management — registry officers and inspectors
//     {
//         pathPrefix: '/admin/registry',
//         allowedRoles: ['admin', 'super_admin', 'registry_officer', 'inspector'],
//     },
//     // Audit / compliance views
//     {
//         pathPrefix: '/admin/compliance',
//         allowedRoles: ['admin', 'super_admin', 'auditor', 'inspector'],
//     },
//     // Member management — admin + registry
//     {
//         pathPrefix: '/admin/members',
//         allowedRoles: ['admin', 'super_admin', 'registry_officer'],
//     },
//     // Catch-all admin: only highest-privilege roles
//     {
//         pathPrefix: '/admin',
//         allowedRoles: ['admin', 'super_admin'],
//     },
// ]

function getAllowedRolesForPath(pathname: string): string[] | null {
    const rbacRules = [
        {
            pathPrefix: '/admin/training',
            allowedRoles: ['admin', 'super_admin', 'instructor', 'examiner'],
        },
        {
            pathPrefix: '/admin/registry',
            allowedRoles: ['admin', 'super_admin', 'registry_officer', 'inspector'],
        },
        {
            pathPrefix: '/admin/compliance',
            allowedRoles: ['admin', 'super_admin', 'auditor', 'inspector', 'examiner'],
        },
        {
            pathPrefix: '/admin/members',
            allowedRoles: ['admin', 'super_admin', 'registry_officer'],
        },
        {
            pathPrefix: '/admin',
            allowedRoles: ['admin', 'super_admin'],
        },
    ]

    for (const rule of rbacRules) {
        if (pathname.startsWith(rule.pathPrefix)) {
            return rule.allowedRoles
        }
    }
    return null // Not an admin route — no role restriction
}

// ============================================================
//  Session Refresh + Auth Guard Middleware
// ============================================================

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Helper to copy cookies from supabaseResponse to a redirect/error response
    const copyCookies = (from: NextResponse, to: NextResponse) => {
        from.cookies.getAll().forEach(cookie => {
            const { name, value, ...options } = cookie
            to.cookies.set(name, value, options)
        })
        return to
    }

    // 1. Skip static assets, public webhooks, and public auth pages to avoid session conflicts
    const isPublicAuthPage =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/reset-password') ||
        request.nextUrl.pathname.startsWith('/auth/callback')

    const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/webhooks')

    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        (request.nextUrl.pathname.startsWith('/api') && isPublicApiRoute) ||
        request.nextUrl.pathname.startsWith('/favicon.ico') ||
        isPublicAuthPage
    ) {
        return supabaseResponse
    }

    // Refresh the session cookie (required for Server Components)
    const { data: { user } } = await supabase.auth.getUser()

    const isApiRoute = request.nextUrl.pathname.startsWith('/api')
    const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

    // 1. Redirect or block unauthenticated users away from all protected routes
    if (!user) {
        if (isPortalRoute || isAdminRoute) {
            const redirectUrl = new URL('/login', request.url)
            redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return copyCookies(supabaseResponse, NextResponse.redirect(redirectUrl))
        }
        if (isApiRoute) {
            return copyCookies(
                supabaseResponse,
                new NextResponse(
                    JSON.stringify({ success: false, error: 'Unauthorized' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                )
            )
        }
    }

    // 2. Route-specific RBAC for admin routes
    if (isAdminRoute && user) {
        const allowedRoles = getAllowedRolesForPath(request.nextUrl.pathname)

        if (allowedRoles) {
            // Fetch role from DB (SSR — anon key + RLS ensures user can only read own profile)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || !allowedRoles.includes(profile.role)) {
                // Redirect to member portal with a "not authorized" flag for UX
                const url = new URL('/portal/member', request.url)
                url.searchParams.set('unauthorized', '1')
                return copyCookies(supabaseResponse, NextResponse.redirect(url))
            }
        }
    }

    // ============================================================
    //  Inactivity Timeout Enforcer (60 Minutes)
    // ============================================================
    const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000 // 60 minutes
    const lastActivityCookie = request.cookies.get('nic_last_active')?.value

    if (user) {
        const now = Date.now()
        if (lastActivityCookie) {
            const lastActiveTime = parseInt(lastActivityCookie, 10)
            
            // If the time since last activity exceeds the timeout, force sign-out
            if (now - lastActiveTime > INACTIVITY_TIMEOUT_MS) {
                // Clear Supabase session cookies
                await supabase.auth.signOut()
                // Clear our custom tracker
                supabaseResponse.cookies.delete('nic_last_active')
                
                if (isApiRoute) {
                    return copyCookies(
                        supabaseResponse,
                        new NextResponse(
                            JSON.stringify({ success: false, error: 'Session expired' }),
                            { status: 401, headers: { 'Content-Type': 'application/json' } }
                        )
                    )
                }
                const redirectUrl = new URL('/login', request.url)
                redirectUrl.searchParams.set('expired', 'true') // Provide UX context
                return copyCookies(supabaseResponse, NextResponse.redirect(redirectUrl))
            }
        }

        // Update the last active timestamp cookie
        supabaseResponse.cookies.set('nic_last_active', now.toString(), {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 // Expire the cookie itself after 1 hour of pure zero-interaction
        })
    }

    return supabaseResponse
}
