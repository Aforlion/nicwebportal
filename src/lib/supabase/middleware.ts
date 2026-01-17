import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    })

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

    // Do not run on static files or API routes
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/favicon.ico')
    ) {
        return supabaseResponse
    }

    // Refresh session if expired - required for Server Components
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes - require authentication
    const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

    // Redirect to login if accessing protected routes without authentication
    if ((isPortalRoute || isAdminRoute) && !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Role-based access control for admin routes
    if (isAdminRoute && user) {
        // Get user profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // Redirect non-admin users away from admin routes
        const isAdmin = ['admin', 'super_admin', 'registry_officer', 'inspector', 'auditor'].includes(profile?.role || '')
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/portal/member', request.url))
        }
    }

    return supabaseResponse
}
