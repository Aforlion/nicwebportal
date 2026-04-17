import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import logger from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/portal/member'

    logger.info('[auth-callback] Received request', {
        url: request.url,
        origin,
        next,
        hasCode: !!code
    })

    if (code) {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
            logger.error('[auth-callback] Code exchange failed', { error })
        } else {
            logger.info('[auth-callback] Code exchange successful')
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            let finalRedirectUrl = `${origin}${next}`
            
            if (isLocalEnv) {
                finalRedirectUrl = `${origin}${next}`
            } else if (forwardedHost) {
                finalRedirectUrl = `https://${forwardedHost}${next}`
            }

            logger.info('[auth-callback] Redirecting user', { finalRedirectUrl })
            return NextResponse.redirect(finalRedirectUrl)
        }
    }

    // return the user to an error page with instructions
    const errorRedirectUrl = `${origin}/login?error=Could not authenticate user`
    logger.warn('[auth-callback] Authentication failed or code missing, redirecting to login', { errorRedirectUrl })
    return NextResponse.redirect(errorRedirectUrl)
}
