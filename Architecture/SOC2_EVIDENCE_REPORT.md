# NIC Portal — SOC 2 Audit Evidence Report

**Generated At:** 2026-09-24T12:40:22.652Z  
**System Target:** NIC Portal Production Stack  
**Audit Status:** **READINESS VERIFIED**  

---

## 1. Environment Security Checks
- **Target Host:** `https://fyaeabdaxqrdosdksqwx.supabase.co`
- **Service Role Key Isolated:** ✅ YES
- **Transactional Mailer Configured:** ✅ YES
- **Payment Gateway Key Isolated:** ✅ YES

## 2. Technical Control Architecture Checks
- **Automated Dependabot Patching:** ✅ Verified (`.github/dependabot.yml`)
- **HTTP Security Headers:** ✅ Verified (`next.config.ts`)
- **NDPA Privacy & Data Protection Page:** ✅ Verified (`/privacy`)
- **AICPA SOC 2 Controls Matrix:** ✅ Verified (`Architecture/SOC2_CONTROLS_MATRIX.md`)
- **Third-Party Vendor Risk Register:** ✅ Verified (`Architecture/VENDOR_RISK_REGISTER.md`)

## 3. Database & RLS Security Status
- **Database Reachability:** ✅ Healthy
- Table `accreditation_applications`: RLS & Schema Active (3 records)
- Table `admin_audit_logs`: RLS & Schema Active (1 records)
- Table `assessment_submissions`: RLS & Schema Active (263 records)
- Table `assessments`: RLS & Schema Active (106 records)
- Table `caregiver_career_pathways`: RLS & Schema Active (0 records)
- Table `caregiver_certifications`: RLS & Schema Active (1 records)
- Table `certificates`: RLS & Schema Active (7 records)
- Table `course_modules`: RLS & Schema Active (52 records)
- Table `course_recommendations`: RLS & Schema Active (0 records)
- Table `courses`: RLS & Schema Active (25 records)
- Table `cpd_activities`: RLS & Schema Active (0 records)
- Table `cpd_records`: RLS & Schema Active (0 records)
- Table `disciplinary_records`: RLS & Schema Active (0 records)
- Table `documents`: RLS & Schema Active (11 records)
- Table `enrollments`: RLS & Schema Active (36 records)
- Table `facilities`: RLS & Schema Active (12 records)
- Table `facility_admins`: RLS & Schema Active (0 records)
- Table `facility_staff`: RLS & Schema Active (0 records)
- Table `gallery`: RLS & Schema Active (0 records)
- Table `inspection_scores`: RLS & Schema Active (0 records)
- Table `inspections`: RLS & Schema Active (0 records)
- Table `internship_cohorts`: RLS & Schema Active (2 records)
- Table `internship_enrollments`: RLS & Schema Active (0 records)
- Table `internship_locations`: RLS & Schema Active (1 records)
- Table `internships`: RLS & Schema Active (0 records)
- Table `kb_articles`: RLS & Schema Active (0 records)
- Table `kb_embeddings`: RLS & Schema Active (0 records)
- Table `kb_escalations`: RLS & Schema Active (0 records)
- Table `kb_feedback`: RLS & Schema Active (0 records)
- Table `kb_versions`: RLS & Schema Active (0 records)
- Table `lesson_progress`: RLS & Schema Active (360 records)
- Table `lessons`: RLS & Schema Active (351 records)
- Table `membership_applications`: RLS & Schema Active (0 records)
- Table `membership_invitations`: RLS & Schema Active (4 records)
- Table `memberships`: RLS & Schema Active (144 records)
- Table `modules`: RLS & Schema Active (66 records)
- Table `news_events`: RLS & Schema Active (0 records)
- Table `nic_api_logs`: RLS & Schema Active (0 records)
- Table `payments`: RLS & Schema Active (116 records)
- Table `pending_registrations`: RLS & Schema Active (140 records)
- Table `profiles`: RLS & Schema Active (136 records)
- Table `programs`: RLS & Schema Active (1 records)
- Table `publications`: RLS & Schema Active (0 records)
- Table `registry_actions`: RLS & Schema Active (6 records)
- Table `resources`: RLS & Schema Active (0 records)
- Table `signup_errors`: RLS & Schema Active (2 records)
- Table `verification_logs`: RLS & Schema Active (2 records)

---
### Audit Evidence Log Verified by NIC Engineering Team.
