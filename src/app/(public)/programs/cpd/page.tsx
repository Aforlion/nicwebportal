import React from 'react'
import CPDCatalogClient, { CPDCourseItem } from '@/components/cpd/cpd-catalog-client'
import cpdCoursesJson from '@/data/cpd_courses.json'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, ShieldCheck, Sparkles, CheckCircle2, BookOpen } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'CPD Micro-Credentials & Courses | National Institute of Caregivers Nigeria',
  description: 'Browse, enrol, and earn official Continuing Professional Development (CPD) points and micro-credentials from NIC Nigeria.',
}

export default function PublicCPDCatalogPage() {
  const courses: CPDCourseItem[] = cpdCoursesJson as CPDCourseItem[]

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Hero Header Section */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 opacity-90" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold tracking-widest text-xs px-3 py-1 mb-4 uppercase">
            CONTINUING PROFESSIONAL DEVELOPMENT (CPD)
          </Badge>
          
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight mb-4 text-white">
            NIC CPD Micro-Credential Suite
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Elevate your professional caregiving practice with 15 specialized micro-credentials designed for Nigerian healthcare assistants, home caregivers, and facility staff.
          </p>

          {/* Quick Value Props Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Verifiable CPD Points</h4>
                <p className="text-xs text-slate-300">Earn 5 to 12 official CPD points per completed course.</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Member Discounts</h4>
                <p className="text-xs text-slate-300">Up to 40% discount for registered NIC Professional Members.</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Downloadable Handbooks</h4>
                <p className="text-xs text-slate-300">Sanitized, publication-ready curriculum study guides.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Catalog Container */}
      <section className="container mx-auto px-4 mt-10 max-w-7xl">
        
        {/* Subscription / Annual Pass Banner */}
        <Card className="mb-10 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white border-2 border-amber-500/40 shadow-xl overflow-hidden relative">
          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <Badge className="bg-amber-500 text-slate-950 font-bold uppercase tracking-wider text-xs">
                BEST VALUE BUNDLE
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-amber-300">
                Annual CPD All-Access Subscription Pass
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Get 12-month unlimited access to all 15 CPD Micro-Credentials, automatic annual credit compliance logging, and an official Annual CPD Verification Certificate.
              </p>
            </div>

            <div className="text-center md:text-right flex-shrink-0 bg-white/10 p-5 rounded-2xl border border-white/10 w-full md:w-auto">
              <span className="block text-xs font-semibold text-slate-300 uppercase">Annual Pass Fee</span>
              <span className="text-3xl font-bold text-amber-400 font-mono">₦45,000</span>
              <span className="block text-[11px] text-slate-300 mt-0.5 mb-3">/ Year for Members</span>
              
              <Link href="/portal/member/cpd">
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs w-full shadow-md">
                  Get Annual All-Access Pass
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Interactive CPD Catalog */}
        <CPDCatalogClient courses={courses} />

      </section>

    </div>
  )
}
