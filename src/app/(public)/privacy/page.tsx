import { Metadata } from "next";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy & NDPA Compliance | National Institute of Caregivers",
  description:
    "Official Privacy Policy of the National Institute of Caregivers (NIC) governing data processing in accordance with the Nigeria Data Protection Act (NDPA).",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-900/50 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30 mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Statutory Compliance Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            NIC Privacy Policy & Data Protection Statement
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Governing data collection, storage, and rights under the <strong>Nigeria Data Protection Act (NDPA 2023)</strong> and international privacy standards.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-slate-800 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> 1. Commitment to Data Protection
            </h2>
            <p>
              The National Institute of Caregivers (NIC) is committed to protecting the privacy, confidentiality, and security of all students, accredited caregivers, facility representatives, and platform users. All personal data collected by NIC is processed strictly in accordance with the <strong>Nigeria Data Protection Act (NDPA 2023)</strong> and applicable global privacy regulations (including GDPR principles for international stakeholders).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Eye className="h-5 w-5 text-emerald-600" /> 2. Information We Collect
            </h2>
            <p>NIC collects personal and professional data necessary for education, certification, accreditation, and verification services. This includes:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-700">
              <li><strong>Identity & Contact Information:</strong> Full name, national identity (NIN/Passport), date of birth, residential address, email, and phone number.</li>
              <li><strong>Academic & Qualification Records:</strong> Prior educational attainment, course progress, clinical assessment scores, assessment answers, and internship completion letters.</li>
              <li><strong>Professional Verification Data:</strong> Caregiver license numbers, facility registration details, employment history, and supervisor evaluation reports.</li>
              <li><strong>Technical & Usage Logs:</strong> IP address, browser metadata, session duration, and security audit logs for system integrity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileText className="h-5 w-5 text-emerald-600" /> 3. Purpose of Data Processing
            </h2>
            <p>Your information is processed exclusively for institutional and statutory objectives:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Credential Administration
                </h4>
                <p className="text-xs text-slate-600">Managing course enrollments, issuing certificates, academic transcripts, and official verification badges.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Registry & Public Verification
                </h4>
                <p className="text-xs text-slate-600">Maintaining the official Public Caregiver & Facility Accreditation Registry for verified employer lookups.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Regulatory Inspections
                </h4>
                <p className="text-xs text-slate-600">Executing clinical facility compliance audits, inspection scoring, and professional disciplinary reviews.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> System Security
                </h4>
                <p className="text-xs text-slate-600">Detecting fraudulent credential claims, securing portal access, and maintaining automated audit trails.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Lock className="h-5 w-5 text-emerald-600" /> 4. Data Security & Retention
            </h2>
            <p>
              NIC implements enterprise-grade security controls to prevent unauthorized access, data loss, or disclosure. All stored database content is encrypted at rest (AES-256) and in transit (TLS 1.3). Access to sensitive records is governed strictly by <strong>Row Level Security (RLS)</strong> and Role-Based Access Controls (RBAC).
            </p>
            <p>
              Academic and certification records are retained permanently to support credential verification requests by third-party healthcare employers. Technical logs and transient files are pruned in accordance with NIC data lifecycle policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              5. User Rights Under NDPA 2023
            </h2>
            <p>As a data subject under the NDPA, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-700">
              <li>Request access to your personal data held by NIC.</li>
              <li>Request correction of inaccurate or incomplete personal information.</li>
              <li>Object to or request restriction of data processing, subject to statutory obligations.</li>
              <li>Request erasure of personal records, provided such records are not required by law or active professional certification standards.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-900 text-white p-6 rounded-2xl">
            <h3 className="text-base font-bold text-emerald-400">Data Protection Officer & Inquiries</h3>
            <p className="text-xs text-slate-300">
              For any privacy concerns, data access requests, or NDPA compliance inquiries, please contact our Data Protection Office:
            </p>
            <p className="text-xs font-semibold text-slate-200">
              Email: <a href="mailto:privacy@nicnigeria.org" className="text-emerald-400 hover:underline">privacy@nicnigeria.org</a> | Official Portal: <Link href="/contact" className="text-emerald-400 hover:underline">nicnigeria.org/contact</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
