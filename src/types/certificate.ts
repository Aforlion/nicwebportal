export type FacilityTypeKey = 
  | 'agency' 
  | 'care_agency' 
  | 'care_home' 
  | 'assisted_living' 
  | 'training_agency' 
  | 'training_institution' 
  | 'hospital' 
  | 'clinical_facility' 
  | 'general';

export type CertificateCategory = 
  | 'facility_membership' 
  | 'ncna_license' 
  | 'course_completion' 
  | 'individual_membership';

export interface CertificateTheme {
  id: string;
  name: string;
  badgeLabel: string;
  titleHeader: string;
  subtitleHeader: string;
  primaryColor: string; // Tailwind / Hex
  secondaryColor: string;
  accentGold: string;
  bgGradient: string;
  borderOuter: string;
  borderInner: string;
  sealText: string;
  watermarkIcon: string;
  emblemBadgeBg: string;
  emblemTextColor: string;
}

export interface PremiumCertificateData {
  certificateNumber: string;
  recipientName: string;
  recipientSubtitle?: string;
  facilityType?: string;
  facilityTypeKey?: FacilityTypeKey;
  category: CertificateCategory;
  titleOverride?: string;
  courseOrProgramName?: string;
  resultOrLevel?: string;
  issueDate: string; // ISO string or formatted date
  validUntil?: string;
  duration?: string; // e.g. "1 Year (01 Jan 2026 - 31 Dec 2026)"
  verificationUrl: string;
  studentIdOrRegNumber?: string;
  learningHoursOrCapacity?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signatorySignatureUrl?: string;
  sealText?: string;
}
