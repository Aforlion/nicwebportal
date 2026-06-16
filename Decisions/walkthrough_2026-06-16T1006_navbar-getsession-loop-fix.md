# Walkthrough: Navbar getSession Loop Fix (Follow-up)
**Date:** 2026-06-16T10:06

## Problem

After the initial middleware/singleton fix, the infinite token refresh loop persisted on the **public homepage** (`nicnigeria.org`). The console showed:

- `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`
- `429 (Too Many Requests)` — Supabase rate-limiting the flood of retries

## Root Cause

The `Navbar` component used `supabase.auth.getSession()` to check if a user was logged in. This is the critical difference:

| Method | Behaviour on stale token |
|---|---|
| `getSession()` | Returns data from **local storage**, silently attempts token refresh, **retries forever** on failure |
| `getUser()` | Makes a **server-side** request, returns an error immediately on invalid token — **does not retry** |

Since the Navbar renders on every public page, a user with a stale/revoked refresh token in their browser triggered an endless refresh cycle that maxed out both the client and Supabase's rate limits.

## Fix Applied

**Modified File:** [navbar.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/components/navbar.tsx)

### 1. Replace `getSession()` → `getUser()`
`getUser()` validates the token server-side and returns an error on the first failure — no retries, no loop.

### 2. Sign out on any auth error
On error or missing user, `supabase.auth.signOut()` is called immediately to **wipe the stale token from localStorage/cookies**, preventing any future retry attempts.

```typescript
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
    await supabase.auth.signOut() // Clear stale token from storage
    return
}
```

### 3. Scope `onAuthStateChange` profile fetches to specific events
The listener now only fetches the user profile on `SIGNED_IN` or `TOKEN_REFRESHED` events — not on every auth event fire. This eliminates unnecessary DB calls during the auth lifecycle.

```typescript
if (event === 'SIGNED_OUT' || !session?.user) {
    // clear state and return early
}
if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // fetch profile
}
```

---

## Verification Results
* Ran `npx tsc --noEmit` on the codebase.
* Compilation result: **Success (0 errors)**.
