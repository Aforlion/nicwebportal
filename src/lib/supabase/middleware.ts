import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
const ROUTE_RBAC: { pathPrefix: string; allowedRoles: string[] }[] = [
    // Training management — instructors can access alongside admins
    {
        pathPrefix: '/admin/training',
        allowedRoles: ['admin', 'super_admin', 'instructor'],
    },
    // Registry / facility management — registry officers and inspectors
    {
        pathPrefix: '/admin/registry',
        allowedRoles: ['admin', 'super_admin', 'registry_officer', 'inspector'],
    },
    // Audit / compliance views
    {
        pathPrefix: '/admin/compliance',
        allowedRoles: ['admin', 'super_admin', 'auditor', 'inspector'],
    },
    // Member management — admin + registry
    {
        pathPrefix: '/admin/members',
        allowedRoles: ['admin', 'super_admin', 'registry_officer'],
    },
    // Catch-all admin: only highest-privilege roles
    {
        pathPrefix: '/admin',
        allowedRoles: ['admin', 'super_admin'],
    },
]

function getAllowedRolesForPath(pathname: string): string[] | null {
    for (const rule of ROUTE_RBAC) {
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
    const supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Skip static assets and API routes (server actions are protected at the action level)
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/favicon.ico')
    ) {
        return supabaseResponse
    }

    // Refresh the session cookie (required for Server Components)
    const { data: { user } } = await supabase.auth.getUser()

    const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

    // 1. Redirect unauthenticated users away from all protected routes
    if ((isPortalRoute || isAdminRoute) && !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
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
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
