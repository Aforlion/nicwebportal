"use client"

import React from "react"
import Image from "next/image"
import QRCodeDisplay from "./qr-code-display"
import { 
  Award, 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  Hospital, 
  Calendar, 
  FileCheck, 
  Hash, 
  Clock, 
  CheckCircle2 
} from "lucide-react"
import { PremiumCertificateData, CertificateTheme, FacilityTypeKey } from "@/types/certificate"

interface PremiumCertificateViewProps {
  data: PremiumCertificateData
  className?: string
}

/**
 * Returns visual theme configuration based on facility type key or certificate category.
 */
function getCertificateTheme(typeKey?: FacilityTypeKey, category?: string): CertificateTheme {
  const k = (typeKey || '').toLowerCase()
  const cat = (category || '').toLowerCase()

  if (k === 'agency' || k === 'care_agency') {
    return {
      id: 'agency',
      name: 'Care Agency',
      badgeLabel: 'CERTIFIED CARE AGENCY',
      titleHeader: 'NATIONAL CERTIFIED CARE AGENCY',
      subtitleHeader: 'OFFICIAL INSTITUTIONAL MEMBERSHIP & OPERATIONAL CREDENTIAL',
      primaryColor: '#0f172a', // Deep Slate / Navy
      secondaryColor: '#1e3a8a',
      accentGold: '#d97706',
      bgGradient: 'from-slate-900 via-slate-800 to-blue-950',
      borderOuter: 'border-[#b45309]',
      borderInner: 'border-[#f59e0b]/50',
      sealText: 'OFFICIAL AGENCY SEAL',
      watermarkIcon: 'building',
      emblemBadgeBg: 'bg-slate-900 text-amber-400 border-amber-500/40',
      emblemTextColor: 'text-amber-500',
    }
  }

  if (k === 'care_home' || k === 'assisted_living') {
    return {
      id: 'care_home',
      name: 'Care Home Facility',
      badgeLabel: 'ACCREDITED CARE FACILITY',
      titleHeader: 'ACCREDITED CARE HOME & RESIDENTIAL FACILITY',
      subtitleHeader: 'NATIONAL INSTITUTIONAL MEMBERSHIP & QUALITY ACCREDITATION',
      primaryColor: '#064e3b', // Deep Emerald
      secondaryColor: '#047857',
      accentGold: '#d97706',
      bgGradient: 'from-emerald-950 via-teal-900 to-slate-900',
      borderOuter: 'border-[#047857]',
      borderInner: 'border-[#10b981]/50',
      sealText: 'ACCREDITED FACILITY SEAL',
      watermarkIcon: 'home',
      emblemBadgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      emblemTextColor: 'text-emerald-600',
    }
  }

  if (k === 'training_agency' || k === 'training_institution') {
    return {
      id: 'training_agency',
      name: 'Training Institution',
      badgeLabel: 'OFFICIAL TRAINING INSTITUTION',
      titleHeader: 'ACCREDITED TRAINING INSTITUTION',
      subtitleHeader: 'OFFICIAL ACADEMIC & CLINICAL EDUCATION PROVIDER',
      primaryColor: '#7f1d1d', // Deep Burgundy / Crimson
      secondaryColor: '#991b1b',
      accentGold: '#d97706',
      bgGradient: 'from-rose-950 via-red-900 to-slate-950',
      borderOuter: 'border-[#991b1b]',
      borderInner: 'border-[#f43f5e]/50',
      sealText: 'ACADEMIC BOARD SEAL',
      watermarkIcon: 'graduation',
      emblemBadgeBg: 'bg-rose-950 text-rose-300 border-rose-500/40',
      emblemTextColor: 'text-rose-700',
    }
  }

  if (k === 'hospital' || k === 'clinical_facility') {
    return {
      id: 'hospital',
      name: 'Clinical Partner',
      badgeLabel: 'LICENSED CLINICAL PARTNER',
      titleHeader: 'REGISTERED CLINICAL PARTNER FACILITY',
      subtitleHeader: 'NATIONAL HEALTHCARE & CLINICAL PLACEMENT INSTITUTION',
      primaryColor: '#0369a1', // Sapphire Blue
      secondaryColor: '#0284c7',
      accentGold: '#d97706',
      bgGradient: 'from-sky-950 via-blue-900 to-slate-950',
      borderOuter: 'border-[#0284c7]',
      borderInner: 'border-[#38bdf8]/50',
      sealText: 'CLINICAL BOARD SEAL',
      watermarkIcon: 'hospital',
      emblemBadgeBg: 'bg-sky-950 text-sky-300 border-sky-500/40',
      emblemTextColor: 'text-sky-600',
    }
  }

  if (cat === 'ncna_license') {
    return {
      id: 'ncna',
      name: 'NCNA License',
      badgeLabel: 'NATIONAL CAREGIVER LICENSE',
      titleHeader: 'NATIONAL CERTIFIED NURSING ASSISTANT',
      subtitleHeader: 'OFFICIAL PROFESSIONAL CAREGIVING LICENSE',
      primaryColor: '#1c1a17',
      secondaryColor: '#a58219',
      accentGold: '#c5a029',
      bgGradient: 'from-[#1c1a17] to-[#2d2a26]',
      borderOuter: 'border-[#c5a029]',
      borderInner: 'border-[#c5a029]/60',
      sealText: 'OFFICIAL REGISTRY SEAL',
      watermarkIcon: 'license',
      emblemBadgeBg: 'bg-[#faf9f5] text-[#a58219] border-[#c5a029]',
      emblemTextColor: 'text-[#a58219]',
    }
  }

  // Fallback / General Membership / Course Completion
  return {
    id: 'general',
    name: 'Official Certificate',
    badgeLabel: 'NATIONAL INSTITUTE CERTIFIED',
    titleHeader: 'MEMBERSHIP CERTIFICATE',
    subtitleHeader: 'OFFICIAL INSTITUTIONAL CREDENTIAL',
    primaryColor: '#0f172a',
    secondaryColor: '#334155',
    accentGold: '#d97706',
    bgGradient: 'from-slate-900 to-slate-800',
    borderOuter: 'border-[#d97706]',
    borderInner: 'border-[#f59e0b]/50',
    sealText: 'OFFICIAL SEAL OF EXCELLENCE',
    watermarkIcon: 'award',
    emblemBadgeBg: 'bg-slate-900 text-amber-400 border-amber-500/40',
    emblemTextColor: 'text-amber-600',
  }
}

export default function PremiumCertificateView({ data, className = '' }: PremiumCertificateViewProps) {
  const theme = getCertificateTheme(data.facilityTypeKey, data.category)

  // Use custom title if specified in data, else use theme header title
  const displayTitle = data.titleOverride || theme.titleHeader
  const displaySubtitle = theme.subtitleHeader

  // Format issue date nicely
  const formattedIssueDate = data.issueDate 
    ? new Date(data.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  // Calculate default membership duration string if not explicitly passed
  let durationDisplay = data.duration
  if (!durationDisplay) {
    if (data.validUntil) {
      const untilDateStr = new Date(data.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      durationDisplay = `12 Months (Valid until ${untilDateStr})`
    } else {
      const currentYear = new Date().getFullYear()
      durationDisplay = `1 Year (${currentYear} - ${currentYear + 1})`
    }
  }

  return (
    <div className={`relative w-full max-w-[900px] aspect-[1.414] bg-[#FAF9F6] text-slate-800 shadow-2xl overflow-hidden print:shadow-none print:w-full print:h-full print:m-0 print:p-0 ${className}`}>
      
      {/* Decorative Outer Geometric Gold Frame */}
      <div className="absolute inset-3 border-[3px] border-[#D97706] pointer-events-none z-20" />
      <div className="absolute inset-[18px] border border-[#D97706]/40 pointer-events-none z-20" />

      {/* Top Left Ribbon Trim SVG */}
      <div className="absolute top-0 left-0 w-44 h-44 pointer-events-none z-30">
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
          <path d="M0,0 L100,0 L0,100 Z" fill="currentColor" />
          <path d="M0,0 L70,0 L0,70 Z" fill="#0f172a" />
          <path d="M0,70 L70,0 L75,0 L0,75 Z" fill="#d97706" />
          <path d="M0,85 L85,0 L92,0 L0,92 Z" fill="#f59e0b" opacity="0.8" />
        </svg>
      </div>

      {/* Bottom Right Ribbon Trim SVG */}
      <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none z-30 transform rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
          <path d="M0,0 L100,0 L0,100 Z" fill="currentColor" />
          <path d="M0,0 L70,0 L0,70 Z" fill="#0f172a" />
          <path d="M0,70 L70,0 L75,0 L0,75 Z" fill="#d97706" />
          <path d="M0,85 L85,0 L92,0 L0,92 Z" fill="#f59e0b" opacity="0.8" />
        </svg>
      </div>

      {/* Background Watermark Crest */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0">
        <Image 
          src="/coat-of-arm.png" 
          alt="Watermark Crest" 
          width={450} 
          height={450} 
          className="object-contain"
        />
      </div>

      {/* Top Right Certificate No Badge */}
      <div className="absolute top-6 right-8 text-right z-30">
        <p className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Certificate No.</p>
        <p className="text-xs font-mono font-bold text-slate-900 tracking-widest">{data.certificateNumber}</p>
      </div>

      {/* Main Content Layout Container */}
      <div className="relative z-10 h-full p-10 px-12 flex flex-col justify-between items-center text-center">
        
        {/* HEADER SECTION */}
        <div className="w-full flex flex-col items-center pt-2">
          {/* Institution Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-14 h-14 rounded-lg bg-white shadow-md p-1 border border-[#D97706]/40 flex items-center justify-center">
              <Image 
                src="/logo.jpg" 
                alt="NIC Logo" 
                width={48} 
                height={48} 
                className="object-contain rounded"
              />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold tracking-[0.25em] text-[#D97706] uppercase font-sans">
                National Institute of Caregivers
              </span>
              <span className="block text-[10px] font-medium tracking-widest text-slate-500 uppercase">
                NIC NIGERIA REGISTRY BOARD
              </span>
            </div>
          </div>

          {/* Gold Divider Line with Diamond Accent */}
          <div className="flex items-center w-full max-w-md my-2">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D97706] to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#D97706] mx-2" />
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D97706] to-transparent" />
          </div>

          {/* Certificate Title */}
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-wider text-slate-900 uppercase my-0.5">
            {displayTitle}
          </h1>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#B45309] uppercase mb-3">
            {displaySubtitle}
          </p>

          {/* Recognition Type Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase shadow-sm ${theme.emblemBadgeBg}`}>
            {theme.id === 'agency' && <Building2 className="w-3 h-3 text-amber-400" />}
            {theme.id === 'care_home' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
            {theme.id === 'training_agency' && <GraduationCap className="w-3 h-3 text-rose-400" />}
            {theme.id === 'hospital' && <Hospital className="w-3 h-3 text-sky-400" />}
            {theme.id === 'ncna' && <Award className="w-3 h-3 text-amber-400" />}
            {theme.id === 'general' && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
            <span>{theme.badgeLabel}</span>
          </div>
        </div>

        {/* RECIPIENT BODY SECTION */}
        <div className="w-full max-w-2xl my-2">
          <p className="text-xs italic text-slate-600 font-serif mb-1">
            This is to officially certify that
          </p>

          <div className="relative inline-block my-1 px-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 capitalize tracking-wide border-b-2 border-[#D97706] pb-1">
              {data.recipientName}
            </h2>
          </div>

          <p className="text-xs italic text-slate-600 font-serif mt-2 max-w-xl mx-auto leading-relaxed">
            {data.category === 'facility_membership' ? (
              <>
                having completed all mandatory institutional registrations, satisfied NIC regulatory compliance, 
                and fulfilled facility standards, is hereby admitted as an official certified member institution.
              </>
            ) : data.category === 'ncna_license' ? (
              <>
                having fulfilled all academic requirements, completed supervised clinical internship, and passed state licensing assessments, 
                is hereby granted the official license of National Certified Nursing Assistant.
              </>
            ) : (
              <>
                having successfully completed the prescribed curriculum and satisfied all academic standards, 
                is hereby awarded this official Certificate of Completion.
              </>
            )}
          </p>
        </div>

        {/* 2-COLUMN METADATA CARD (Matching attached reference sample) */}
        <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-sm my-2 text-left grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          
          {/* Column 1 */}
          <div className="space-y-1.5 border-r border-slate-200/80 pr-4">
            <div className="flex items-start gap-2">
              <Hash className="w-3.5 h-3.5 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight">
                  {data.category === 'facility_membership' ? 'Facility / Reg ID' : 'Student ID'}
                </p>
                <p className="text-[11px] font-bold text-slate-800 font-mono">
                  {data.studentIdOrRegNumber || data.certificateNumber.replace('NIC-', 'ID-')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight">Category / Type</p>
                <p className="text-[11px] font-bold text-slate-800 capitalize">
                  {data.facilityType || theme.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight">Date Issued</p>
                <p className="text-[11px] font-bold text-slate-800">{formattedIssueDate}</p>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-1.5 pl-2">
            <div className="flex items-start gap-2">
              <FileCheck className="w-3.5 h-3.5 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight">Certificate Number</p>
                <p className="text-[11px] font-bold text-slate-800 font-mono">{data.certificateNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight">Membership Duration</p>
                <p className="text-[11px] font-bold text-slate-800">{durationDisplay}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight">Authenticity Verification</p>
                <p className="text-[11px] font-semibold text-emerald-700">Verified & Active</p>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER SECTION: SIGNATURES, SEAL & QR CODE */}
        <div className="w-full flex items-end justify-between pt-2 border-t border-slate-200/80">
          
          {/* Bottom Left: QR Code & Verify Badge */}
          <div className="flex flex-col items-center">
            <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
              <QRCodeDisplay value={data.verificationUrl} size={64} />
            </div>
            <div className="mt-1 bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase">
              SCAN TO VERIFY
            </div>
          </div>

          {/* Bottom Center: Validity Disclaimer */}
          <div className="text-center max-w-xs px-2">
            <p className="text-[9px] text-slate-500 leading-tight">
              This certificate is issued electronically under the authority of the National Institute of Caregivers (NIC Nigeria) 
              and is valid without alteration.
            </p>
            <p className="text-[9px] font-semibold text-slate-700 mt-1">
              Verify authenticity at: <span className="underline font-mono text-[9px] text-[#D97706]">nicnigeria.org/verify</span>
            </p>
          </div>

          {/* Bottom Right: Authorized Signature & Embossed Seal Stamp */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              {/* Signature Line */}
              <div className="w-32 border-b border-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-900">{data.signatoryName || 'Prof. M. A. Ojo'}</p>
              <p className="text-[9px] text-slate-500 font-medium">{data.signatoryTitle || 'Registrar General, NIC Nigeria'}</p>
            </div>

            {/* Gold Embossed Official Seal Graphic */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#b45309] via-[#f59e0b] to-[#fef3c7] p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-full border border-amber-900/40 border-dashed flex flex-col items-center justify-center text-center p-1 bg-gradient-to-br from-[#d97706] to-[#b45309] text-white">
                <Award className="w-5 h-5 text-amber-200 mb-0.5" />
                <span className="text-[6px] font-black tracking-widest uppercase text-amber-100 leading-none">
                  NIC OFFICIAL
                </span>
                <span className="text-[6px] font-extrabold tracking-tighter text-white leading-none">
                  SEAL
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
