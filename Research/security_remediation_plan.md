# Security Remediation Plan: NIC Portal

**Prepared by:** Security Architect  
**Status:** DRAFT (Ready for Review)  
**Target:** NIC Portal (Production Environment)  

---

## 1. Executive Summary

This Security Remediation Plan has been compiled following a review of the **Technical Health Report** and the **Strategic Delivery Plan**. 

While the core user-facing login pathways are functional, the system has exposed public endpoints lacking rate limiting, database tables without Row-Level Security (RLS) protections, and implicit grant token exposures on the client side. This plan defines the technical remediation pathways to mitigate these risks.

---

## 2. Vulnerability Review & Remediation Strategy

### 2.1 Missing Rate Limiting on Password Reset Requests
* **Severity:** **High**
* **Vulnerability:** The public server action `requestPasswordResetAction` does not check request frequencies.
* **Remediation:** Apply IP-level and email-level sliding window limits using the established Upstash Redis rate limiter.
* **Remediation Code (Server Action Integration):**
  ```typescript
  import { checkRateLimit } from "@/lib/rate-limit"
  import { headers } from "next/headers"
  
  export async function requestPasswordResetAction(email: string) {
      if (!email) return { success: false, error: "Email is required" }
      
      const headerList = await headers()
      const ip = headerList.get('x-forwarded-for') ?? 'unknown'
      
      // Limit to 3 reset requests per 10 minutes per IP/Email combo
      const isAllowed = await checkRateLimit('email', `reset-request:${ip}:${email}`)
      if (!isAllowed) {
          return { success: false, error: "Too many password reset requests. Please wait a few minutes." }
      }
      
      // ... Proceed with generation
  }
  ```

---

### 2.2 Unprotected Registry Database Tables (Missing RLS)
* **Severity:** **Medium**
* **Vulnerability:** `facilities` and `inspections` tables are defined without RLS policies in the migration histories.
* **Remediation:** Enable RLS and implement role-based access policies restricting access to owners, registry officers, inspectors, and administrators.
* **Remediation SQL (Migration Script):**
  ```sql
  -- Enable Row Level Security
  ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
  ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
  
  -- Facilities Policies
  CREATE POLICY "Allow public read access to active registrations" ON facilities
    FOR SELECT USING (status = 'active');
    
  CREATE POLICY "Allow owners to manage own facility data" ON facilities
    FOR ALL USING (auth.uid() = owner_id);
    
  CREATE POLICY "Allow registry officers/admins full control" ON facilities
    FOR ALL USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer')
    ));
    
  -- Inspections Policies
  CREATE POLICY "Allow inspectors to read/write assigned inspections" ON inspections
    FOR ALL USING (auth.uid() = inspector_id);
    
  CREATE POLICY "Allow owners to view conducted inspections" ON inspections
    FOR SELECT USING (EXISTS (
      SELECT 1 FROM facilities WHERE id = facility_id AND owner_id = auth.uid()
    ));
  ```

---

### 2.3 Client-Side Token Exposure (Implicit Grant Fallback)
* **Severity:** **Medium**
* **Vulnerability:** The URL hash contains `access_token` and `refresh_token` fragments on client redirection. If XSS is present, tokens can be read immediately.
* **Remediation:** 
  1. Once `setSession` completes, immediately purge the hash fragment from browser history to limit token lifespan in DOM.
  2. Configure short-lived access tokens (e.g., 15 minutes) in Supabase dashboard.
* **Purge Pattern Implementation:**
  ```javascript
  // Immediately inside client-side verification
  if (window.location.hash.includes('access_token=')) {
      // Establish session...
      // Then clean DOM/URL immediately:
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  ```

---

### 2.4 Session Timeout Bypass for Backend Operations
* **Severity:** **High**
* **Vulnerability:** Middleware does not check `/api` endpoints for activity tracker cookie state.
* **Remediation:** Update middleware routing to allow authentication state checks on `/api` routes, returning standard `401 Unauthorized` responses instead of doing full client redirects.
* **Remediation Code (Middleware Update):**
  ```typescript
  // In middleware.ts
  if (request.nextUrl.pathname.startsWith('/api')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !request.nextUrl.pathname.startsWith('/api/webhooks')) {
          return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
          });
      }
      return supabaseResponse;
  }
  ```

---

## 3. Verification & Compliance Checklist

- [ ] Run brute force simulation on `requestPasswordResetAction` to ensure request blockage after 3 limits.
- [ ] Attempt direct query on `facilities` from unauthenticated client SDK to verify `401 RLS Block`.
- [ ] Confirm browser URL address bar is clean of `#access_token` immediately after password reset redirects.
