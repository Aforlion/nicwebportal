import { Metadata } from "next";
import { FileText, ShieldAlert, Scale, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | National Institute of Caregivers",
  description:
    "Official Terms of Use governing access to the National Institute of Caregivers (NIC) portal, student training, certification verification, and facility accreditation.",
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-900/50 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30 mb-4">
            <Scale className="h-4 w-4 text-emerald-400" /> Legal Governance Framework
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            NIC Terms of Use & Platform Agreement
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Governing access to the National Institute of Caregivers website, student learning portal, digital verification registry, and accreditation services.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-slate-800 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileText className="h-5 w-5 text-emerald-600" /> 1. Introduction & Acceptance
            </h2>
            <p>
              Welcome to the digital platforms of the <strong>National Institute of Caregivers (NIC)</strong>. These Terms of Use constitute a legally binding agreement between you and NIC. By accessing or using our student portals, verification tools, training programs, or facility accreditation services, you agree to comply fully with these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              2. User Eligibility & Accounts
            </h2>
            <p>
              Access to NIC programs requires users to be at least 18 years of age or operating under authorized institutional sponsorship. Users are strictly responsible for maintaining account credential secrecy. Providing fraudulent identity data or misrepresenting professional qualifications will result in immediate account suspension and cancellation of certificates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              3. Verification & Digital Credentials
            </h2>
            <p>
              Official NIC certificates, academic transcripts, and badges feature embedded QR codes linked to our public verification registry. Public verification tools are provided for informational and employment validation purposes. Unauthorized duplication, tampering, or misrepresentation of NIC certificates is strictly prohibited and subject to legal prosecution under the laws of the Federal Republic of Nigeria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" /> 4. Professional Disclaimer
            </h2>
            <p>
              NIC accreditation and training certificates demonstrate institutional competence and completion of standard caregiver curricula. NIC credentials do not replace statutory government licenses where explicitly mandated by law. NIC does not provide medical treatment or clinical diagnosis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              5. Governing Law
            </h2>
            <p>
              These Terms of Use and all associated platform operations are governed by and construed in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-4">
            <span>© National Institute of Caregivers (NIC). All Rights Reserved.</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-emerald-700 font-bold hover:underline">Privacy Policy</Link>
              <Link href="/contact" className="text-emerald-700 font-bold hover:underline">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
