# NIC Portal — AICPA SOC 2 Controls Matrix & Readiness Reference

**Document ID:** SOC2-MATRIX-001  
**Framework:** AICPA Trust Services Criteria (2017 Criteria for Security, Availability, Confidentiality, Processing Integrity, Privacy)  
**Target:** National Institute of Caregivers (NIC) Infrastructure  
**Auditor Reference:** Internal SOC 2 Type I / Type II Evidence Blueprint  

---

## 1. Common Criteria (CC) — Security Controls

| Criterion ID | Control Description | NIC Portal Technical Implementation | Evidence & Verification Vector |
| :--- | :--- | :--- | :--- |
| **CC1.1 / CC1.2** | COSO Control Environment & Integrity | Formulated strict Code of Ethics, NDPA Data Governance policies, and role definitions across all system users. | `Architecture/SECURITY_AND_COMPLIANCE.md`, `NIC policies/` |
| **CC2.1 / CC2.2** | Internal & External Security Communications | Public Trust Portal at `/security`, `/privacy`, and `/terms`. Security disclosure mailbox (`security@nicnigeria.org`). | [`/security`](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/(public)/security/page.tsx) |
| **CC3.1 / CC3.2** | Risk Assessment & Vulnerability Scans | Daily GitHub Dependabot vulnerability scans on npm dependencies; Vercel deployment build security guards. | `.github/dependabot.yml` |
| **CC5.1 / CC5.2** | Logical Access Controls (Least Privilege) | Supabase Row Level Security (RLS) on all database tables. Next.js middleware checking user roles (`STUDENT`, `ADMIN`, `FACILITY`). | `supabase/fix_rls_hardening.sql`, `src/middleware.ts` |
| **CC6.1 / CC6.2** | Boundary Defense & Transport Encryption | All traffic forced over HTTPS (TLS 1.3). HSTS preloading enabled. HTTP Security Headers enforced via Next.js config. | `next.config.ts` (`async headers()`) |
| **CC6.6 / CC6.7** | Secret & Credentials Protection | Zero plain-text credentials in repository. Environment variables loaded via `.env.local` and Vercel Encrypted Secrets. | `example.env` |
| **CC7.1 / CC7.2** | Change Management & Code Review | All production releases pushed via Git source control (`main` branch) with automated build verification (`npm run build`). | Git commit history (`origin/main`) |
| **CC8.1** | Incident Response & Breach Management | 5-phase Incident Response Plan (SOP-SEC-002) with 72-hour NDPC breach notification workflow. | `Architecture/INCIDENT_RESPONSE_PLAN.md` |

---

## 2. Availability Criteria (A1)

| Criterion ID | Control Description | NIC Portal Technical Implementation | Evidence Vector |
| :--- | :--- | :--- | :--- |
| **A1.1 / A1.2** | System Resilience & Backups | Supabase Point-In-Time Recovery (PITR) automated daily backups with multi-region database redundancy. | `scripts/check-database-health.ts` |
| **A1.3** | Global Content Delivery | Vercel Edge Serverless Infrastructure delivering static/dynamic pages with 99.9% availability targets. | `vercel.json` |

---

## 3. Confidentiality & Privacy Criteria (C1 / P1)

| Criterion ID | Control Description | NIC Portal Technical Implementation | Evidence Vector |
| :--- | :--- | :--- | :--- |
| **C1.1 / P1.1** | PII Identification & Consent | Explicit NDPA 2023 compliant privacy notices and user consent collection on onboarding forms. | `src/app/(public)/privacy/page.tsx` |
| **P3.1 / P4.1** | Data Storage Encryption | Database records encrypted at rest using AES-256 in Supabase PostgreSQL; files encrypted in bucket storage. | `supabase/init_storage.sql` |

---

### © National Institute of Caregivers (NIC). Confidential Compliance Mapping.
