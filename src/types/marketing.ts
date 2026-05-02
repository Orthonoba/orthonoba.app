// ─── Campaign ─────────────────────────────────────────────────────────────────

export type CampaignType =
  | 'seo'
  | 'sem-google'
  | 'sem-bing'
  | 'facebook-ads'
  | 'instagram-ads'
  | 'email'
  | 'whatsapp'
  | 'sms'
  | 'referral'
  | 'organic-social'
  | 'pr'

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'

export type CampaignObjective =
  | 'brand-awareness'
  | 'lead-generation'
  | 'appointment-booking'
  | 'patient-retention'
  | 'treatment-promotion'

export interface Campaign {
  id: string
  clinicId: string
  name: string
  type: CampaignType
  status: CampaignStatus
  objective?: CampaignObjective
  budget?: number
  currency?: string
  startDate: string
  endDate?: string
  /** Google Ads / Meta campaign ID or similar */
  externalId?: string
  externalPlatformUrl?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── UTM Tracking ─────────────────────────────────────────────────────────────

export interface UTMParams {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

// ─── Campaign Metrics (daily snapshots) ──────────────────────────────────────

export interface CampaignMetric {
  id: string
  campaignId: string
  clinicId: string
  /** ISO date 'YYYY-MM-DD' */
  date: string
  impressions?: number
  clicks?: number
  leads?: number
  conversions?: number
  spend?: number
  /** Click-through rate (0–1) */
  ctr?: number
  /** Cost per click */
  cpc?: number
  /** Cost per acquisition */
  cpa?: number
  /** Return on ad spend */
  roas?: number
  createdAt: string
}

// ─── Lead CRM ─────────────────────────────────────────────────────────────────

export type LeadSource =
  | 'google-organic'
  | 'google-ads'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'email-campaign'
  | 'whatsapp'
  | 'referral-patient'
  | 'referral-doctor'
  | 'walk-in'
  | 'phone'
  | 'website-form'
  | 'doctoralia'
  | 'topdoctors'
  | 'other'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'appointment-scheduled'
  | 'converted'    // became a Patient
  | 'nurturing'
  | 'lost'

export interface Lead {
  id: string
  clinicId: string
  name: string
  email?: string
  phone?: string
  status: LeadStatus
  source: LeadSource
  utm?: UTMParams
  /** Dental treatments the lead is interested in */
  interestedIn?: string[]
  estimatedValue?: number
  /** Assigned staff member */
  assignedTo?: string
  campaignId?: string
  /** Set when the lead converts to a Patient */
  convertedPatientId?: string
  convertedAt?: string
  lastContactedAt?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Review Requests ──────────────────────────────────────────────────────────

export type ReviewChannel =
  | 'google-business'
  | 'doctoralia'
  | 'topdoctors'
  | 'trustpilot'
  | 'facebook'
  | 'email'
  | 'whatsapp'

export type ReviewRequestStatus = 'pending' | 'sent' | 'completed' | 'declined' | 'expired'

export interface ReviewRequest {
  id: string
  clinicId: string
  patientId: string
  channel: ReviewChannel
  status: ReviewRequestStatus
  rating?: number
  reviewText?: string
  reviewUrl?: string
  sentAt?: string
  completedAt?: string
  createdAt: string
}

// ─── Referral Program ─────────────────────────────────────────────────────────

export interface ReferralProgram {
  id: string
  clinicId: string
  name: string
  isActive: boolean
  /** Reward for the referring patient */
  referrerReward?: string
  /** Reward for the new patient */
  refereeReward?: string
  validFrom: string
  validUntil?: string
  maxUses?: number
  totalUses: number
  createdAt: string
}

export interface ReferralLink {
  id: string
  clinicId: string
  programId: string
  referrerPatientId: string
  code: string
  uses: number
  convertedLeadIds: string[]
  createdAt: string
}

// ─── SEO Snapshot ─────────────────────────────────────────────────────────────

export interface SeoSnapshot {
  id: string
  clinicId: string
  date: string
  domain: string
  /** Google Business Profile overall rating */
  googleRating?: number
  googleReviewCount?: number
  doctoraliaRating?: number
  doctoraliaReviewCount?: number
  /** Organic position for clinic's main keyword */
  mainKeywordPosition?: number
  mainKeyword?: string
  createdAt: string
}
