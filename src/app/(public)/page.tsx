import { Hero } from "@/components/hero"
import { MandateSection } from "@/components/mandate-section"
import Link from "next/link"
import { Users, Building2, ClipboardCheck, ArrowRight, CheckCircle2, Search, GraduationCap } from "lucide-react"

export default function Home() {
  return (
    <>
      <Hero />

      {/* Trust Stats Section */}
      <section className="bg-white border-y py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-secondary">2,500+</p>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-wider">Certified Caregivers</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-secondary">12+</p>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-wider">Accredited Partners</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-secondary">15,000+</p>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-wider">Verifications Done</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                <GraduationCap className="h-6 w-6" />
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-secondary">5+</p>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-wider">Approved Curricula</p>
            </div>
          </div>
        </div>
      </section>

      <MandateSection />

      {/* Cohort Journey Pathfinder */}
      <section className="bg-slate-50 py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
              Your Journey Starts Here
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Select the option below that matches your profile to get started immediately.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Cohort 1: Caregivers & Trainees */}
            <div className="bg-white border rounded-2xl p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Caregivers & Trainees</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Become a certified nursing assistant, register for training, earn licensing credentials, and track your CPD points.
                </p>
                <ul className="space-y-3 mb-8 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    Enroll in accredited care programs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    Obtain public licensing and ID Card
                  </li>
                </ul>
              </div>
              <Link href="/join?type=individual">
                <button className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-md">
                  Join as Caregiver <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Cohort 2: Care Facilities & Training Partners */}
            <div className="bg-white border rounded-2xl p-8 hover:border-accent/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Facilities & Training Centers</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Accredit your training institution, submit caregiver curricula for certification, and hire verified staff directly.
                </p>
                <ul className="space-y-3 mb-8 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    Apply for NIC Institutional Seal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    Register students under institutional discount
                  </li>
                </ul>
              </div>
              <Link href="/join/facility">
                <button className="w-full bg-accent hover:bg-accent/95 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-md">
                  Accredit Facility <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Cohort 3: Public & Employers */}
            <div className="bg-white border rounded-2xl p-8 hover:border-blue-400/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Employers & Public</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Instantly verify caregiver certifications, check license numbers, and access our public directory of active caregivers.
                </p>
                <ul className="space-y-3 mb-8 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    Verify license codes in real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    Access public directories of certified carers
                  </li>
                </ul>
              </div>
              <Link href="/verify">
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-md">
                  Verify Credentials <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
