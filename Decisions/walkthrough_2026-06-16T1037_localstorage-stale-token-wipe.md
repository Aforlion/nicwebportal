# Walkthrough: Stale Token localStorage Wipe (Defence-in-Depth)
**Date:** 2026-06-16T1037

## Problem

The infinite refresh loop persisted in a browser that had previously logged in, even after deploying the `getUser()` fix. A fresh browser had no issue. This confirmed the root cause was a **stale Supabase auth token locked in the original browser's `localStorage`** — a server-side deployment cannot touch client-side storage.

## Why the Previous Fix Wasn't Enough

Our `getUser()` + `signOut()` call in the Navbar runs when the component mounts. However, the Supabase `createBrowserClient` starts its own internal **auto-refresh timer** the moment the client is instantiated — before any React component mounts. This means:

```
Page loads
  ↓
Supabase client created → reads stale token from localStorage
  ↓
Background auto-refresh fires immediately → 400 Bad Request
  ↓
Retries... (loop already running before Navbar mounts)
  ↓
Navbar mounts → getUser() → signOut() → clears token
```

The loop gets started before our cleanup code even runs.

## Fix Applied

**Modified File:** [index.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/supabase/index.ts)

Added a **global `SIGNED_OUT` listener directly on the singleton client**, registered once at client creation time. When the Supabase client itself gives up on a bad token and fires `SIGNED_OUT`, we immediately wipe all `sb-*-auth-token` keys from `localStorage` — before any component has a chance to retry.

```typescript
client.auth.onAuthStateChange((event: string) => {
    if (event === 'SIGNED_OUT') {
        clearSupabaseStorage() // Wipes all sb-*-auth-token keys from localStorage
    }
})
```

This fires **at the client level** — earlier than any component lifecycle — stopping the loop at its source.

## Immediate Fix for Users Already Stuck

For any user currently stuck in the loop in their browser, they can clear site data manually:

1. Open **DevTools → Application → Storage → Local Storage** → clear all `sb-*` keys
2. OR go to **Browser Settings → Privacy → Clear site data** for `nicnigeria.org`

Once the new code is deployed, this will happen automatically on the next page load.

---

## Verification Results
* Ran `npx tsc --noEmit` on the codebase.
* Compilation result: **Success (0 errors)**.
