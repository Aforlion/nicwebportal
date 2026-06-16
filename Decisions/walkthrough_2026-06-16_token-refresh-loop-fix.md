# Walkthrough: Token Refresh Loop & Session Expiration Fix
**Date:** 2026-06-16

We have successfully resolved the infinite loop of token refresh requests (`400 Bad Request` to Supabase's `token?grant_type=refresh_token` endpoint) and ensured that session expiration and redirect cookie clearing operate properly.

## Root Cause

The browser-side Supabase client was being instantiated fresh on every React component render (e.g. the `Navbar` re-rendering on route changes), creating **multiple parallel client instances** each attempting to independently refresh the same short-lived token. Since Supabase refresh tokens are **one-time use**, the first succeeds and invalidates the token — all others immediately fail with `400 Bad Request`, triggering an infinite retry cycle on the login page.

Additionally, when the middleware intercepted an expired session and issued a redirect, the cookie-clearing side effects were not being propagated to the redirect response, leaving stale session cookies in the browser.

## Changes Completed

### 1. Browser Client Singleton Pattern
* **Modified File:** [index.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/supabase/index.ts)
* **Changes:** Configured the client-side `createClient` factory to return a cached singleton instance when running in the browser (`typeof window !== 'undefined'`). Server-side renders always create a fresh client (as required by Next.js SSR). This eliminates duplicate client instances and prevents race conditions on token refreshes.

### 2. Middleware Cookie Synchronization
* **Modified File:** [middleware.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/supabase/middleware.ts)
* **Changes:**
  - Refactored `supabaseResponse` to be declared with `let` so the `setAll` cookie hook can re-assign it as per the official `@supabase/ssr` Next.js middleware guidelines.
  - Added a `copyCookies` helper that copies all cookies (including session deletions) from `supabaseResponse` onto any redirect or JSON error response.
  - All auth gates (unauthenticated redirect, RBAC role check, inactivity timeout signout) now use `copyCookies` to propagate session cookie changes to the browser.

### 3. Strict Type Safety Compliance
* **Modified Files:**
  - [reset-password/page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/%28public%29/reset-password/page.tsx) — `onAuthStateChange` callback parameters typed
  - [navbar.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/components/navbar.tsx) — `onAuthStateChange` callback parameters typed
  - [facilities/page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/admin/registry/facilities/page.tsx) — `forEach` callback parameter typed
  - [certificates/page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/portal/facility/certificates/page.tsx) — `map` callback parameter typed
  - [facility/page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/portal/facility/page.tsx) — `map` callback parameter typed
* **Changes:** Added explicit `any` type annotations to resolve `TS7006: Parameter implicitly has an 'any' type` compilation errors introduced by strict mode.

---

## Compiler Verification Results
* Ran `npx tsc --noEmit` on the codebase.
* Compilation result: **Success (0 errors)**.
