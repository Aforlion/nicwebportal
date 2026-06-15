# Technical Due Diligence & Health Report: NIC Portal

This technical health report summarizes the due diligence audit performed on the NIC Portal codebase, focusing on system stability, security posture, authentication flows, session handling, and mobile learning experience.

---

## 1. Executive Summary

The NIC Portal is built on a modern stack utilizing Next.js (App Router), Supabase SSR, and Resend for email communications. A recent triage phase successfully resolved three critical auth and session bugs that previously prevented users from logging in or resetting passwords. However, the system still exhibits architectural fragility, rate-limiting gaps, and responsive layout concerns. 

Stabilizing these issues must be prioritized to prevent downstream security vulnerabilities, operational friction, and user drop-offs.

---

## 2. Findings & Classification

Below is a classified list of current findings.

### Critical Severity

#### 1. Implicit Grant / PKCE Alignment in Auth Invites
* **Status:** Partially mitigated (temporary patch applied).
* **Details:** Supabase admin-generated recovery/invite links use the Implicit Grant flow (which returns credentials in URL hash fragments, e.g., `#access_token=...`), whereas the standard authentication uses PKCE (which uses query parameters, e.g., `?code=...`). Since URL hashes are never sent to server-side middleware, routing these through `/auth/callback` originally caused silent session failures.
* **Current Mitigation:** Links now point directly to `/reset-password` (client-side page) where client-side JavaScript manually parses `window.location.hash` and calls `setSession`.
* **Long-Term Risk:** Client-side token parsing is vulnerable to access token extraction via cross-site scripting (XSS).

---

### High Severity

#### 1. Public Password Reset Endpoint Lacks Rate Limiting
* **Location:** [request-reset.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/actions/auth/request-reset.ts)
* **Details:** The server action `requestPasswordResetAction` generates recovery links and sends emails via Resend. Unlike `loginAction`, it has **no rate-limiting checks** implemented.
* **Risk:** Malicious actors could spam this public endpoint to flood users with emails, causing rapid depletion of Resend API quotas, high financial costs, and potential blacklisting of the domain.

#### 2. Session Timeout Cookie Bypasses API Requests
* **Location:** [middleware.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/supabase/middleware.ts#L101-L114)
* **Details:** The 60-minute inactivity timeout tracks user activity via the `nic_last_active` cookie. However, the middleware immediately returns and skips processing for any request path starting with `/api`.
* **Risk:** While the application primarily uses Server Actions, any background API requests or future endpoint integrations will fail to update the inactivity timestamp, causing active users to be suddenly logged out after 60 minutes of page-navigation idle time.

---

### Medium Severity

#### 1. Mobile Curriculum Sidebar Usability
* **Location:** [page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/portal/student/courses/%5Bid%5D/page.tsx#L116-L123)
* **Details:** In the Mobile Learning view, the course curriculum sidebar is pushed below the main content area (using `order-last lg:order-first`). 
* **Risk:** When students are using mobile devices, they cannot easily see their progress or select other lessons without scrolling past the entire active lesson content, video, and description.

#### 2. Missing Row-Level Security (RLS) on Facilities and Inspections
* **Location:** [schema.sql](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/supabase/schema.sql)
* **Details:** Although `profiles`, `programs`, and `enrollments` tables have strict RLS policies enabled and hardened, the `facilities` and `inspections` tables are not protected by RLS rules in the schema.
* **Risk:** If RLS is not enabled on those tables, direct queries through the client-side Supabase SDK could potentially fetch or modify registry data without authorization.

---

### Low Severity

#### 1. Redundant getSession Calls during Password Reset
* **Location:** [page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/%28public%29/reset-password/page.tsx#L143)
* **Details:** The password update flow contains commented-out checks and manual bypasses to prevent cookie update deadlocks. While functional, it increases maintenance complexity.

#### 2. Development Scripts Left in Production Codebase
* **Location:** Root directory
* **Details:** Multiple scratch files (e.g., `debug_pdf.js`, `check_inactive.js`, `extract_level4_root.js`) and environment backups (`env.deploy`) remain in the root directory.
* **Risk:** Clogs repository structure and risks accidental exposure of production credentials if backups are committed.

---

## 3. Technical Health Summary

| Category | Status | Notes |
| :--- | :--- | :--- |
| **Authentication** | Stable (Patched) | Client-side fallback handles implicit token parsing reliably for now. |
| **Password Reset Flow** | Stable (Patched) | Deadlock and false timeout errors resolved; needs rate-limiting. |
| **Admin Dashboard** | Complete | All core sub-routes (training, members, reports, inspections) are structured and integrated with database metrics. |
| **Mobile Learning** | Functional | Responsive layouts are active, but navigation hierarchy requires optimization. |
| **Security Posture** | Good | Edge rate-limiting and RLS hardening applied, with slight gaps on specific tables and public endpoints. |
| **Session Management** | Moderate | 60-minute inactivity timer runs on middleware; edge cases exist for `/api` and fetch calls. |
| **Technical Debt** | Low | High-quality Next.js App Router codebase, minimal build/typescript warning noise. |
