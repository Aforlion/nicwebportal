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
      primaryColor: '#0f172a',
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
      primaryColor: '#064e3b',
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
      primaryColor: '#7f1d1d',
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
      primaryColor: '#0369a1',
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

  const displayTitle = data.titleOverride || theme.titleHeader
  const displaySubtitle = theme.subtitleHeader

  const formattedIssueDate = data.issueDate 
    ? new Date(data.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

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

  // Pre-formatted body text string to prevent JSX line-break word fusing
  const bodyText = data.category === 'facility_membership'
    ? "having completed all mandatory institutional registrations, satisfied NIC regulatory compliance, and fulfilled facility standards, is hereby admitted as an official certified member institution."
    : data.category === 'ncna_license'
    ? "having fulfilled all academic requirements, completed supervised clinical internship, and passed state licensing assessments, is hereby granted the official license of National Certified Nursing Assistant."
    : "having successfully completed the prescribed curriculum and satisfied all academic standards, is hereby awarded this official Certificate of Completion."

  return (
    <>
      {/* Strict Single-Page Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0 !important;
          }
          html, body {
            background: #FAF9F6 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            display: flex !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 2rem !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            background-color: #FAF9F6 !important;
            z-index: 999999 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
        }
      `}</style>

      <div 
        id="printable-certificate"
        className={`relative w-full max-w-[940px] aspect-[1.414] bg-[#FAF9F6] text-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none ${className}`}
      >
        {/* Outer Gold Border Frame */}
        <div className="absolute inset-3 border-[3px] border-[#D97706] pointer-events-none z-20" />
        <div className="absolute inset-[14px] border border-[#D97706]/40 pointer-events-none z-20" />

        {/* Top Left Ribbon Accent */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-30">
          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
            <path d="M0,0 L100,0 L0,100 Z" fill="currentColor" />
            <path d="M0,0 L68,0 L0,68 Z" fill="#0f172a" />
            <path d="M0,68 L68,0 L74,0 L0,74 Z" fill="#d97706" />
            <path d="M0,84 L84,0 L90,0 L0,90 Z" fill="#f59e0b" opacity="0.85" />
          </svg>
        </div>

        {/* Bottom Right Ribbon Accent */}
        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-30 transform rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
            <path d="M0,0 L100,0 L0,100 Z" fill="currentColor" />
            <path d="M0,0 L68,0 L0,68 Z" fill="#0f172a" />
            <path d="M0,68 L68,0 L74,0 L0,74 Z" fill="#d97706" />
            <path d="M0,84 L84,0 L90,0 L0,90 Z" fill="#f59e0b" opacity="0.85" />
          </svg>
        </div>

        {/* Background Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0">
          <Image 
            src="/coat-of-arm.png" 
            alt="Watermark Crest" 
            width={380} 
            height={380} 
            className="object-contain"
          />
        </div>

        {/* Top Right Certificate No Badge */}
        <div className="absolute top-4 right-6 text-right z-30">
          <p className="text-[8.5px] font-mono uppercase text-slate-500 tracking-wider">CERTIFICATE NO.</p>
          <p className="text-xs font-mono font-bold text-slate-900 tracking-wider">{data.certificateNumber}</p>
        </div>

        {/* HEADER SECTION */}
        <div className="relative z-10 w-full flex flex-col items-center pt-0.5">
          {/* Logo & Institution Header */}
          <div className="flex items-center gap-2.5 mb-1">
            <div className="relative w-11 h-11 rounded-lg bg-white shadow-sm p-1 border border-[#D97706]/40 flex items-center justify-center flex-shrink-0">
              <Image 
                src="/logo.jpg" 
                alt="NIC Logo" 
                width={36} 
                height={36} 
                className="object-contain rounded"
              />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold tracking-[0.22em] text-[#D97706] uppercase font-sans leading-none mb-0.5">
                NATIONAL INSTITUTE OF CAREGIVERS
              </span>
              <span className="block text-[8.5px] font-semibold tracking-widest text-slate-500 uppercase leading-none">
                NIC NIGERIA REGISTRY BOARD
              </span>
            </div>
          </div>

          {/* Gold Divider Line */}
          <div className="flex items-center w-full max-w-xs my-1">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D97706] to-transparent" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#D97706] mx-1.5" />
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D97706] to-transparent" />
          </div>

          {/* Certificate Title */}
          <h1 className="text-2xl sm:text-[28px] font-serif font-extrabold tracking-wider text-slate-900 uppercase my-0.5 leading-tight">
            {displayTitle}
          </h1>
          <p className="text-[9.5px] font-semibold tracking-[0.2em] text-[#B45309] uppercase mb-1.5">
            {displaySubtitle}
          </p>

          {/* Recognition Badge Pill */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[8.5px] font-bold tracking-widest uppercase shadow-sm ${theme.emblemBadgeBg}`}>
            {theme.id === 'agency' && <Building2 className="w-3 h-3 text-amber-400 flex-shrink-0" />}
            {theme.id === 'care_home' && <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
            {theme.id === 'training_agency' && <GraduationCap className="w-3 h-3 text-rose-400 flex-shrink-0" />}
            {theme.id === 'hospital' && <Hospital className="w-3 h-3 text-sky-400 flex-shrink-0" />}
            {theme.id === 'ncna' && <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />}
            {theme.id === 'general' && <CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0" />}
            <span>{theme.badgeLabel}</span>
          </div>
        </div>

        {/* RECIPIENT & CREDENTIAL BODY */}
        <div className="relative z-10 w-full max-w-2xl mx-auto my-0.5 text-center">
          <p className="text-[11px] italic text-slate-600 font-serif mb-0.5">
            This is to officially certify that
          </p>

          <div className="relative inline-block my-0.5 px-6 max-w-full">
            <h2 className="text-2xl sm:text-[28px] font-serif font-bold text-slate-900 capitalize tracking-wide border-b-2 border-[#D97706] pb-0.5">
              {data.recipientName}
            </h2>
          </div>

          <p className="text-[10.5px] italic text-slate-600 font-serif mt-1 max-w-xl mx-auto leading-normal">
            {bodyText}
          </p>
        </div>

        {/* 2-COLUMN METADATA GRID (No overflow, no text truncation) */}
        <div className="relative z-10 w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border border-[#D97706]/35 rounded-xl p-3 px-5 shadow-sm my-1 grid grid-cols-2 gap-x-8 gap-y-2 text-left">
          
          {/* Column 1 */}
          <div className="space-y-2 border-r border-slate-200/90 pr-4">
            <div className="flex items-center gap-2.5">
              <Hash className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  {data.category === 'facility_membership' ? 'FACILITY / REG ID' : 'STUDENT ID'}
                </p>
                <p className="text-xs font-bold text-slate-800 font-mono leading-tight">
                  {data.studentIdOrRegNumber || data.certificateNumber.replace('NIC-', 'ID-')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  CATEGORY / TYPE
                </p>
                <p className="text-xs font-bold text-slate-800 capitalize leading-tight">
                  {data.facilityType || theme.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  DATE ISSUED
                </p>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {formattedIssueDate}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-2 pl-2">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  CERTIFICATE NUMBER
                </p>
                <p className="text-xs font-bold text-slate-800 font-mono leading-tight">
                  {data.certificateNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  MEMBERSHIP DURATION
                </p>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {durationDisplay}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  AUTHENTICITY VERIFICATION
                </p>
                <p className="text-xs font-bold text-emerald-700 leading-tight">
                  Verified & Active
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER SECTION: SIGNATURE, OFFICIAL GOLD SEAL & QR CODE */}
        <div className="relative z-10 w-full flex flex-col items-center pt-1 border-t border-slate-200/90">
          
          <div className="w-full flex items-end justify-between px-2 mb-1">
            
            {/* Left Column: Signatory Signature & Title */}
            <div className="flex flex-col items-start min-w-[170px]">
              {/* Calligraphic Signature Stroke */}
              <div className="h-8 flex items-end mb-1 pl-2">
                <span className="font-serif italic font-extrabold text-xl text-slate-800 tracking-wide transform -rotate-2 select-none opacity-90">
                  {data.signatoryName || 'Olatunji Joel'}
                </span>
              </div>
              <div className="w-36 border-b-2 border-slate-800 mb-1" />
              <p className="text-[11px] font-bold text-slate-900 leading-tight">
                {data.signatoryName || 'Olatunji Joel'}
              </p>
              <p className="text-[8px] text-slate-500 font-semibold leading-tight">
                {data.signatoryTitle || 'Executive Director, Programmes'}
              </p>
            </div>

            {/* Center Column: Official Embossed Gold Medallion Seal */}
            <div className="relative flex flex-col items-center justify-center -mb-1 z-20">
              {/* Gold Ribbon Tails */}
              <div className="absolute -bottom-3 flex gap-1.5 pointer-events-none z-0">
                <div className="w-3.5 h-6 bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#78350f] transform -rotate-12 shadow-md border-t border-amber-300/40" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }} />
                <div className="w-3.5 h-6 bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#78350f] transform rotate-12 shadow-md border-t border-amber-300/40" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }} />
              </div>

              {/* Gold Sunburst Medallion */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#78350f] via-[#f59e0b] to-[#fef3c7] p-1 shadow-xl flex items-center justify-center border border-amber-600/50 z-10">
                <div className="w-full h-full rounded-full border-2 border-amber-950/60 border-dashed flex flex-col items-center justify-center text-center p-1 bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] text-white shadow-inner">
                  <div className="w-full h-full rounded-full border border-amber-200/60 flex flex-col items-center justify-center p-1 bg-gradient-to-tr from-[#92400e] to-[#d97706]">
                    <ShieldCheck className="w-4 h-4 text-amber-200 mb-0.5 drop-shadow" />
                    <span className="text-[5.5px] font-black tracking-widest uppercase text-amber-100 leading-none">
                      OFFICIAL SEAL
                    </span>
                    <span className="text-[5.5px] font-extrabold tracking-wider text-amber-200 leading-none mt-0.5">
                      NIC NIGERIA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code & Verification Badge */}
            <div className="flex flex-col items-end min-w-[140px]">
              <div className="p-1 bg-white rounded-lg border border-slate-300 shadow-md">
                <QRCodeDisplay value={data.verificationUrl} size={54} />
              </div>
              <div className="mt-1 bg-slate-900 text-amber-400 px-2 py-0.5 rounded text-[7px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-2.5 h-2.5" /> SCAN TO VERIFY
              </div>
            </div>

          </div>

          {/* Bottom Center: Validity Disclaimer */}
          <div className="text-center w-full max-w-lg mt-1 pt-1 border-t border-slate-200/70">
            <p className="text-[8px] font-medium text-slate-600 leading-tight">
              This certificate is issued electronically and is valid without alteration.
            </p>
            <p className="text-[8px] font-bold text-slate-800 mt-0.5">
              Verify authenticity at: <span className="underline font-mono text-[8px] text-[#B45309]">www.nicnigeria.org/verify</span>
            </p>
          </div>

        </div>

      </div>
    </>
  )
}
