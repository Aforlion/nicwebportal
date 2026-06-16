# Implementation Plan: Fix Infinite Token Refresh Loop & Session Expiration Redirection

This plan resolves the infinite loop of failed token refresh requests (`400 Bad Request` for `token?grant_type=refresh_token`) on the login page and ensures that redirecting responses preserve the cookie updates (like cleared sessions).

## User Review Required

> [!NOTE]
> We will configure the browser client as a singleton on the client side to prevent multiple React components from instantiating their own Supabase client, which can trigger duplicate authentication requests and refresh token loops.

> [!IMPORTANT]
> The Next.js middleware will be updated to copy the cookies from the `supabaseResponse` to any redirect or unauthorized responses. This ensures that when the session is cleared (e.g. on invalid token or inactivity timeout), the cookie deletion is successfully sent to the browser.

## Proposed Changes

---

### Supabase Core Client Configuration

#### [MODIFY] [index.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/supabase/index.ts)
- Modify the client-side browser client to act as a singleton on the browser. This prevents multiple parallel instances of the client from spinning up on pages with client components (like the `Navbar`), avoiding race conditions and duplicate calls.

---

### Middleware Configuration

#### [MODIFY] [middleware.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/supabase/middleware.ts)
- Declare `supabaseResponse` with `let` instead of `const`.
- Update `setAll` implementation to align with official `@supabase/ssr` documentation guidelines (updating request headers and re-creating `supabaseResponse` appropriately).
- Add a helper function `copyCookies` to copy all modified cookies from `supabaseResponse` to any redirect response or manual JSON response.
- Update all `NextResponse.redirect` and custom JSON `NextResponse` returns to use `copyCookies` before returning, ensuring cookie changes (like clearing expired sessions) are sent back to the browser.

## Verification Plan

### Manual Verification
1. Run `npm run dev` to start the development server.
2. Open the page in a browser where the session is expired or has invalid refresh tokens (or clear local cookies/storage partially to simulate it).
3. Verify that the login page loads cleanly without spamming `token?grant_type=refresh_token` requests in the developer console.
4. Verify that logging in with valid credentials redirects to the correct portal route.
5. Verify that accessing a protected route without being logged in redirects to `/login` and successfully clears any stale local session cookies.
