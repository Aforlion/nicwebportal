# NIC Portal — Security & Compliance Architecture Framework

**Version:** 1.0  
**Governing Standard:** NDPA 2023 (Nigeria Data Protection Act) / ISO 27001 & SOC 2 Technical Discipline Baseline  
**Target Platform:** National Institute of Caregivers (NIC) Web Portal  

---

## 1. Executive Summary & Philosophy

NIC Portal adopts a **Security-by-Design** and **Automated Compliance** philosophy. While formal SOC 2 CPA auditing is deferred until triggered by enterprise B2B procurement demands, all core technical security practices (least privilege, continuous vulnerability scanning, encrypted data storage, immutable audit logs, and automated disaster recovery) are enforced automatically within our engineering workflow.

---

## 2. Regulatory Compliance: NDPA 2023 & GDPR Alignment

NIC processes sensitive Personal Identifiable Information (PII), including student identities (NIN/Passports), caregiving qualifications, assessment scores, and facility accreditation records.

### Data Protection Principles Implemented:
1. **Lawful Processing & User Consent:** Users explicitly accept terms during registration and onboarding.
2. **Data Minimization:** Only identity and credential metrics necessary for training and verification are stored.
3. **Data Security & Encryption:**
   - **In-Transit:** TLS 1.3 encryption across all public and API endpoints.
   - **At-Rest:** Supabase PostgreSQL database and object storage encrypted via AES-256.
4. **Data Subject Rights:** Public routes (`/privacy` and `/terms`) enable users to request data correction or deletion.

---

## 3. Engineering Security Controls (SOC 2 Baseline Practices)

### A. Access Control & Row Level Security (RLS)
- **Supabase RLS Enforced:** Every database table (`users`, `assessments`, `certificates`, `facilities`, `internships`) has active RLS policies limiting queries strictly to authenticated roles (`STUDENT`, `ADMIN`, `FACILITY`, `VERIFIER`).
- **Middleware Role Checks:** Next.js middleware guards protected routes (`/dashboard`, `/admin`, `/facility`) preventing unauthorized privilege escalation.

### B. HTTP & Web Application Security
- **Security Headers (`next.config.ts`):**
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
  - `Strict-Transport-Security` (enforces HTTPS with HSTS preloading)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (disables unauthorized device hardware access)

### C. Continuous Vulnerability Patching
- **GitHub Dependabot (`.github/dependabot.yml`):** Runs daily automated scans across all npm dependencies to alert on and patch known CVE vulnerabilities.
- **Vercel Build Guards:** Production deployments fail automatically if breaking security vulnerabilities or exposed secret environment variables are detected.

### D. Backup & Disaster Recovery SOP
- **Automated Daily Backups:** Managed via Supabase Point-in-Time Recovery (PITR) with 7 to 30-day retention windows.
- **Quarterly Recovery Drill SOP:**
  1. Export a point-in-time snapshot of production database via Supabase CLI / `pg_dump`.
  2. Restore to a dedicated isolated staging instance (`nic-staging-db`).
  3. Execute automated smoke test suite to confirm data integrity for users, assessments, and verification records.
  4. Document restoration timestamp and outcome in `Decisions/RECOVERY_DRILL_LOG.md`.

---

## 4. Immutable Audit Trails & Credential Protection

- **Verification QR Code Integrity:** All issued certificates contain SHA-256 cryptographically verifiable QR codes resolving directly to `nicnigeria.org/verify`.
- **System Event Logging:** Critical operations (certificate issuance, password resets, role modifications, and score updates) write structured logs to `winston` / Supabase log sinks.

---

### © National Institute of Caregivers. Internal Engineering & Security SOP.
