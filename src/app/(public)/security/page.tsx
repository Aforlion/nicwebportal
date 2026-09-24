import { Metadata } from "next";
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, Server, Key, FileCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security & SOC 2 Readiness | National Institute of Caregivers",
  description:
    "Overview of NIC Portal security posture, data protection standards, SOC 2 compliance readiness, and responsible vulnerability disclosure policy.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-900/50 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30 mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Trust & Compliance Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            NIC Portal Security Posture & SOC 2 Readiness
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Demonstrating our technical security baseline, encryption standards, access control enforcement, and responsible disclosure program.
          </p>
        </div>

        {/* Core Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Encryption at Rest & Transit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All database records and file storage are encrypted at rest using <strong>AES-256</strong>. All network traffic is forced over <strong>TLS 1.3</strong>.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Row Level Security (RLS)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Granular Supabase Row Level Security ensures strict isolation. Users can only access records explicitly authorized by their role.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Automated Patching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Daily GitHub Dependabot scans ensure npm dependencies and Next.js engine packages are continuously patched against CVE vulnerabilities.
            </p>
          </div>
        </div>

        {/* Detailed Compliance Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-slate-800 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileCheck className="h-5 w-5 text-emerald-600" /> Trust Services Criteria (AICPA SOC 2 Mapping)
            </h2>
            <p>
              NIC Portal aligns with the AICPA SOC 2 Trust Services Criteria across five core domains:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-sm">Security (Common Criteria):</strong>
                  <p className="text-xs text-slate-600">Access controls, MFA authentication, environment variable isolation, and automated web security headers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-sm">Availability & Disaster Recovery:</strong>
                  <p className="text-xs text-slate-600">Vercel Edge global CDN distribution, Supabase Point-in-Time Recovery (PITR) backups, and 99.9% uptime target.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-sm">Confidentiality & Privacy:</strong>
                  <p className="text-xs text-slate-600">Strict NDPA 2023 compliance, data minimization policies, and user identity document encryption.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Vulnerability Disclosure Policy */}
          <section className="space-y-4 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl">
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" /> Responsible Vulnerability Disclosure Program
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              NIC welcomes security researchers and white-hat community members to report potential security vulnerabilities responsibly. We commit to acknowledging all submissions within 48 hours and implementing patches promptly.
            </p>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
              <p className="font-semibold text-slate-200">Guidelines for Vulnerability Reporting:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Do NOT access, alter, or destroy user data or system integrity.</li>
                <li>Do NOT execute denial-of-service (DoS/DDoS) attacks or social engineering.</li>
                <li>Submit detailed steps to reproduce the issue securely to our team.</li>
              </ul>
              <div className="pt-2 text-slate-200 font-mono">
                Security Reports Contact: <a href="mailto:security@nicnigeria.org" className="text-emerald-400 underline">security@nicnigeria.org</a>
              </div>
            </div>
          </section>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-4">
            <span>© National Institute of Caregivers (NIC). All Rights Reserved.</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-emerald-700 font-bold hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="text-emerald-700 font-bold hover:underline">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
