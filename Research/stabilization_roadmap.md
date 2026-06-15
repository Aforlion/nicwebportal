# Stabilization Roadmap: NIC Portal

This stabilization roadmap establishes a step-by-step path to address the issues identified in the Technical Health Report. As per core guidelines, **no new features should be proposed or implemented until this stabilization phase is complete**.

---

## Recommended Implementation Order

### Phase 1: Security & Endpoint Hardening (High Priority)

#### 1. Rate-Limit Password Reset Request Action
* **Target:** [request-reset.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/actions/auth/request-reset.ts)
* **Task:** Integrate the Upstash Redis rate limiter to prevent abuse.
* **Proposed Implementation:**
  ```typescript
  import { checkRateLimit } from "@/lib/rate-limit"
  import { headers } from "next/headers"
  
  // Inside requestPasswordResetAction
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for') ?? 'unknown'
  const isAllowed = await checkRateLimit('email', `reset-request:${ip}`)
  if (!isAllowed) {
      return { success: false, error: "Too many reset attempts. Please try again in a minute." }
  }
  ```

#### 2. Apply Row-Level Security (RLS) on Facilities and Inspections
* **Target:** Supabase Schema
* **Task:** Enable RLS and define access policies for `facilities` and `inspections` tables to prevent unauthorized data reads or writes.
* **Proposed Implementation:**
  ```sql
  ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
  ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can view own facility registration" ON facilities 
    FOR SELECT USING (auth.uid() = owner_id OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'registry_officer')
    ));
    
  CREATE POLICY "Users can create own facility registration" ON facilities
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
  ```

---

### Phase 2: Session & Authentication Robustness (Medium Priority)

#### 1. Enhance Middleware Inactivity Timeout logic
* **Target:** [middleware.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/supabase/middleware.ts)
* **Task:** Ensure background API calls or fetch interactions also touch/update the inactivity timestamp or verify session validity, preventing sudden logout during active interactions.
* **Proposed Implementation:**
  Refactor the middleware bypass logic. Instead of ignoring `/api` completely, only bypass the static assets and public routes. For protected API routes, ensure they still validate auth status but without triggering redirects (instead returning JSON `401 Unauthorized`).

---

### Phase 3: Mobile Learning UX Enhancements (Medium Priority)

#### 1. Mobile-Optimized Course Curriculum Drawer
* **Target:** [page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/portal/student/courses/%5Bid%5D/page.tsx)
* **Task:** Replace the static bottom-positioned sidebar on mobile devices with a floating drawer or collapsible sheet (e.g., Shadcn Sheet component) triggered by a "View Curriculum" button at the top/bottom of the page.
* **Benefit:** Allows students to navigate modules and lessons immediately on small screens without scrolling through long text contents.

---

### Phase 4: Clean Up & Maintenance (Low Priority)

#### 1. Repository Clean Up
* **Target:** Root workspace directory
* **Task:** Remove legacy debug files (`debug_pdf.js`, etc.) and ensure any backups or local environment files (`.env.local`, `env.deploy`) are properly ignored in `.gitignore`.
