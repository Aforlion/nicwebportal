# NIC Portal — Third-Party Vendor Risk Management Register

**Document ID:** VENDOR-RISK-001  
**Governing Standard:** SOC 2 CC9.2 (Vendor Risk Management) / NDPA 2023 Section 39 (Processor Oversight)  
**Target:** National Institute of Caregivers (NIC) Infrastructure Vendors  

---

## 1. Overview & Policy

NIC Portal relies on enterprise-grade third-party infrastructure and API providers. Under SOC 2 Common Criteria 9.2 and NDPA 2023 Section 39, NIC maintains continuous risk evaluation of all vendor processors handling platform data.

---

## 2. Vendor Compliance & Risk Assessment Table

| Vendor Name | Service Provided | Data Processed | Vendor Compliance Certifications | Risk Rating | Review Frequency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vercel Inc.** | Application Hosting & Global Edge CDN | Next.js Serverless Code, Transient HTTP Traffic | SOC 2 Type II, ISO 27001, GDPR | **LOW** | Annual |
| **Supabase Inc.** | Relational Database (PostgreSQL) & File Storage | User Accounts, Student Progress, Certifications, Passports | SOC 2 Type II, ISO 27001, HIPAA Compliant Engine, GDPR | **LOW** | Annual |
| **Paystack Payments Ltd.** | Payment Gateway & Tuition Processing | Payment Tokens, Billing Email, Transaction Logs | PCI-DSS Level 1 Certified, NDPR Compliant | **LOW** | Annual |
| **Resend Inc.** | Transactional Email Delivery | Email Addresses, Credential Emails, Reminder Notifications | SOC 2 Type II, GDPR, TLS 1.3 Transport | **LOW** | Annual |
| **Upstash Inc.** | Distributed Caching & API Rate-Limiting | Transient Session Tokens, IP Address Hashing | SOC 2 Type II, ISO 27001 | **LOW** | Annual |
| **Google Cloud (Generative AI)** | AI Assessment & Curriculum Engine | Anonymized Assessment Content, Curriculum Texts | SOC 2 Type II, ISO 27001, FedRAMP | **LOW** | Annual |

---

## 3. Vendor Incident Monitoring Protocol

1. **Service Uptime Dashboards:** Automated ping monitoring of vendor status pages (e.g. `status.vercel.com`, `status.supabase.com`, `status.paystack.com`).
2. **Credential Rotation Policy:** API keys for third-party processors (Paystack secret keys, Supabase service keys, Resend API keys) are rotated every **90 to 180 days** or immediately upon employee offboarding.
3. **Data Isolation:** No third-party vendor is granted direct administrative access to the underlying raw database host. Access is governed via scoped API keys.

---

### © National Institute of Caregivers (NIC). Confidential Vendor Register.
