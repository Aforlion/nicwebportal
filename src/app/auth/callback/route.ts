import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'
import logger from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    // Restrict relative redirect target to prevent open redirects
    const rawNext = searchParams.get('next') ?? '/portal/member'
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/portal/member'

    logger.info('[auth-callback] Received request', {
        url: request.url,
        origin,
        next,
        hasCode: !!code,
        hasTokenHash: !!tokenHash
    })

    const buildRedirectUrl = () => {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (!isLocalEnv && forwardedHost) {
            return `https://${forwardedHost}${next}`
        }
        return `${origin}${next}`
    }

    if (tokenHash && type) {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (error) {
            logger.error('[auth-callback] OTP verification failed', { error })
        } else {
            const finalRedirectUrl = buildRedirectUrl()
            logger.info('[auth-callback] OTP verification successful, redirecting user', { finalRedirectUrl })
            return NextResponse.redirect(finalRedirectUrl)
        }
    }

    if (code) {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
            logger.error('[auth-callback] Code exchange failed', { error })
        } else {
            const finalRedirectUrl = buildRedirectUrl()
            logger.info('[auth-callback] Code exchange successful, redirecting user', { finalRedirectUrl })
            return NextResponse.redirect(finalRedirectUrl)
        }
    }

    // return the user to an error page with instructions
    const errorRedirectUrl = `${origin}/login?error=Could not authenticate user`
    logger.warn('[auth-callback] Authentication failed or code missing, redirecting to login', { errorRedirectUrl })
    return NextResponse.redirect(errorRedirectUrl)
}
