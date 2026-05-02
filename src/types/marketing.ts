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

export type AttributionModel = 'last-click' | 'first-click' | 'linear' | 'time-decay' | 'data-driven'

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
  date: string                  // ISO 'YYYY-MM-DD'
  impressions?: number
  clicks?: number
  leads?: number
  conversions?: number
  spend?: number
  ctr?: number                  // 0–1
  cpc?: number
  cpa?: number
  roas?: number
  createdAt: string
}

export interface CampaignAnalytics {
  campaignId: string
  clinicId: string
  period: string
  impressions: number
  clicks: number
  ctr: number
  leads: number
  conversions: number
  spend: number
  revenue: number
  roas: number
  cpc: number
  cpa: number
  dailyBreakdown: CampaignMetric[]
  topKeywords?: { keyword: string; clicks: number; conversions: number; cpa: number }[]
  topAds?: { adId: string; headline: string; ctr: number; conversions: number }[]
  attributionModel: AttributionModel
}

// ─── SEO Pages ────────────────────────────────────────────────────────────────

export type DentalTreatmentSlug =
  | 'implantes-dentales'
  | 'ortodoncia-invisible'
  | 'blanqueamiento-dental'
  | 'protesis-dental'
  | 'empastes'
  | 'endodoncia'
  | 'periodoncia'
  | 'cirugia-oral'
  | 'odontopediatria'
  | 'estetica-dental'
  | 'brackets'
  | 'carillas-porcelana'
  | 'urgencias-dentales'

export type SeoStructuredDataType = 'LocalBusiness' | 'MedicalBusiness' | 'Dentist' | 'Service' | 'FAQPage'

export interface SeoContentBlock {
  type: 'hero' | 'faq' | 'benefits' | 'testimonials' | 'cta' | 'text' | 'team' | 'gallery'
  heading?: string
  content: string
  items?: string[]
}

export interface SeoPage {
  id: string
  clinicId: string
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  h1: string
  keywords: string[]
  contentBlocks: SeoContentBlock[]
  treatment?: DentalTreatmentSlug
  city?: string
  locale: string
  canonicalUrl?: string
  ogImage?: string
  structuredDataType: SeoStructuredDataType
  isIndexed: boolean
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Google Ads ───────────────────────────────────────────────────────────────

export type GoogleAdsNetwork = 'search' | 'display' | 'shopping' | 'performance-max' | 'demand-gen'
export type GoogleAdsBidStrategy = 'maximize-clicks' | 'target-cpa' | 'target-roas' | 'maximize-conversions' | 'manual-cpc'
export type KeywordMatchType = 'broad' | 'phrase' | 'exact'

export interface AdSitelink {
  text: string
  url: string
  description1?: string
  description2?: string
}

export interface GoogleAdsKeyword {
  text: string
  matchType: KeywordMatchType
  bidCents?: number
  qualityScore?: number
}

export interface GoogleAdsResponsiveAd {
  id: string
  finalUrl: string
  /** 3–15 headlines, max 30 chars each */
  headlines: string[]
  /** 2–4 descriptions, max 90 chars each */
  descriptions: string[]
  sitelinks?: AdSitelink[]
  callExtension?: string
  displayUrl?: string
}

export interface GoogleAdsAdGroup {
  id: string
  name: string
  keywords: GoogleAdsKeyword[]
  ads: GoogleAdsResponsiveAd[]
  cpcBidCents?: number
  targetCpaCents?: number
}

export interface GoogleAdsCampaign {
  id: string
  clinicId: string
  campaignId: string
  googleCampaignId?: string
  name: string
  network: GoogleAdsNetwork
  bidStrategy: GoogleAdsBidStrategy
  dailyBudgetCents: number
  currency: string
  targetCpaCents?: number
  targetRoas?: number
  geotargets: string[]
  languages: string[]
  adGroups: GoogleAdsAdGroup[]
  status: CampaignStatus
  startDate: string
  endDate?: string
  googleCustomerId?: string
  conversionActions?: string[]
  createdAt: string
  updatedAt?: string
}

// ─── Meta Ads ─────────────────────────────────────────────────────────────────

export type MetaAdObjective = 'AWARENESS' | 'TRAFFIC' | 'ENGAGEMENT' | 'LEADS' | 'APP_PROMOTION' | 'SALES'
export type MetaAdFormat = 'image' | 'video' | 'carousel' | 'collection' | 'instant_experience'
export type MetaAdPlacement = 'facebook_feed' | 'instagram_feed' | 'instagram_stories' | 'facebook_stories' | 'audience_network' | 'reels'
export type MetaCallToAction = 'CONTACT_US' | 'LEARN_MORE' | 'SIGN_UP' | 'CALL_NOW' | 'GET_OFFER' | 'BOOK_TRAVEL' | 'SEND_MESSAGE'

export interface MetaLocation {
  type: 'city' | 'region' | 'country' | 'zip'
  name: string
  key?: string
}

export interface MetaAudience {
  ageMin?: number
  ageMax?: number
  genders?: ('male' | 'female' | 'all')[]
  locations: MetaLocation[]
  interests?: string[]
  behaviors?: string[]
  customAudiences?: string[]
  lookalikeSources?: string[]
  radiusKm?: number
}

export interface MetaCarouselCard {
  headline: string
  description?: string
  imageUrl: string
  linkUrl: string
}

export interface MetaAd {
  id: string
  name: string
  format: MetaAdFormat
  primaryText: string
  headline?: string
  description?: string
  callToAction: MetaCallToAction
  imageUrl?: string
  videoUrl?: string
  landingPageUrl: string
  carouselCards?: MetaCarouselCard[]
}

export interface MetaAdSet {
  id: string
  name: string
  targeting: MetaAudience
  placements: MetaAdPlacement[]
  dailyBudgetCents?: number
  bidAmountCents?: number
  ads: MetaAd[]
}

export interface MetaCampaign {
  id: string
  clinicId: string
  campaignId: string
  metaCampaignId?: string
  name: string
  objective: MetaAdObjective
  dailyBudgetCents?: number
  lifetimeBudgetCents?: number
  currency: string
  adSets: MetaAdSet[]
  status: CampaignStatus
  startDate: string
  endDate?: string
  metaAccountId?: string
  pixelId?: string
  createdAt: string
  updatedAt?: string
}

// ─── Landing Pages ────────────────────────────────────────────────────────────

export type LandingPageTemplate =
  | 'implantes-landing'
  | 'ortodoncia-landing'
  | 'blanqueamiento-landing'
  | 'primera-visita-landing'
  | 'urgencias-landing'
  | 'review-collection'
  | 'custom'

export interface LandingSection {
  type: 'hero' | 'benefits' | 'testimonials' | 'team' | 'gallery' | 'faq' | 'trust-badges' | 'form' | 'map' | 'pricing'
  heading?: string
  content?: string
  items?: { icon?: string; title: string; description?: string; imageUrl?: string }[]
  imageUrl?: string
  videoUrl?: string
}

export interface LeadFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox'
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface LeadFormConfig {
  fields: LeadFormField[]
  submitButtonText: string
  successMessage: string
  redirectUrl?: string
  webhookUrl?: string
  gdprText?: string
  requirePhone: boolean
  requireEmail: boolean
}

export interface LandingPage {
  id: string
  clinicId: string
  slug: string
  title: string
  template: LandingPageTemplate
  headline: string
  subheadline?: string
  ctaText: string
  ctaPhone?: string
  ctaWhatsapp?: string
  sections: LandingSection[]
  formConfig: LeadFormConfig
  seoMeta?: { metaTitle: string; metaDescription: string; keywords: string[] }
  ogImage?: string
  isPublished: boolean
  publishedAt?: string
  campaignId?: string
  utm?: UTMParams
  views: number
  submissions: number
  conversionRate?: number
  createdAt: string
  updatedAt?: string
}

// ─── Marketing Templates ──────────────────────────────────────────────────────

export type TemplateCategory =
  | 'landing-page'
  | 'email'
  | 'whatsapp'
  | 'sms'
  | 'social-post'
  | 'google-ad'
  | 'meta-ad'
  | 'seo-page'

export interface MarketingTemplate {
  id: string
  name: string
  category: TemplateCategory
  treatment?: DentalTreatmentSlug
  /** null = global template, string = clinic-specific */
  clinicId: string | null
  subject?: string
  body: string
  variables: string[]       // e.g. ['clinic_name', 'patient_name', 'treatment']
  previewImageUrl?: string
  isDefault: boolean
  language: string
  createdAt: string
  updatedAt?: string
}

// ─── Lead Funnels ─────────────────────────────────────────────────────────────

export type FunnelType = 'landing-to-appointment' | 'review-collection' | 'referral' | 'reactivation' | 'custom'

export interface FunnelStep {
  id: string
  funnelId: string
  sequence: number
  type: 'landing' | 'form' | 'email' | 'whatsapp' | 'sms' | 'appointment' | 'wait' | 'condition'
  name: string
  config: Record<string, unknown>
  delayMinutes?: number
  condition?: string
  enteredCount: number
  completedCount: number
  exitCount: number
}

export interface LeadFunnel {
  id: string
  clinicId: string
  name: string
  type: FunnelType
  steps: FunnelStep[]
  landingPageId?: string
  campaignId?: string
  isActive: boolean
  totalEntered: number
  totalCompleted: number
  conversionRate: number
  createdAt: string
  updatedAt?: string
}

export interface FunnelSubmission {
  id: string
  funnelId: string
  landingPageId?: string
  clinicId: string
  leadId?: string
  data: Record<string, string>
  utm?: UTMParams
  ipAddress?: string
  userAgent?: string
  referrer?: string
  submittedAt: string
}

// ─── CRM Lead Scoring ─────────────────────────────────────────────────────────

export interface LeadScoreFactor {
  factor: string
  points: number
  reason: string
}

export interface LeadScore {
  leadId: string
  clinicId: string
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  factors: LeadScoreFactor[]
  lastCalculatedAt: string
}

export type LeadActivityType =
  | 'form_submitted'
  | 'page_visited'
  | 'email_opened'
  | 'email_clicked'
  | 'whatsapp_received'
  | 'phone_call'
  | 'appointment_booked'
  | 'appointment_attended'
  | 'appointment_no_show'
  | 'note_added'
  | 'status_changed'

export interface LeadActivity {
  id: string
  leadId: string
  clinicId: string
  type: LeadActivityType
  description: string
  metadata?: Record<string, unknown>
  occurredAt: string
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
  | 'converted'
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
  interestedIn?: string[]
  estimatedValue?: number
  assignedTo?: string
  campaignId?: string
  funnelId?: string
  landingPageId?: string
  score?: number
  scoreGrade?: 'A' | 'B' | 'C' | 'D'
  convertedPatientId?: string
  convertedAt?: string
  lastContactedAt?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Social Automation ────────────────────────────────────────────────────────

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'google-business' | 'twitter'
export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export interface SocialPostMetrics {
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves?: number
  clicks?: number
  updatedAt: string
}

export interface SocialPost {
  id: string
  clinicId: string
  platforms: SocialPlatform[]
  status: SocialPostStatus
  caption: string
  hashtags: string[]
  mediaUrls: string[]
  firstComment?: string
  scheduledAt?: string
  publishedAt?: string
  campaignId?: string
  facebookPostId?: string
  instagramPostId?: string
  googleBusinessPostId?: string
  metrics?: SocialPostMetrics
  createdAt: string
  updatedAt?: string
}

export interface SocialSchedule {
  id: string
  clinicId: string
  name: string
  platforms: SocialPlatform[]
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  preferredDays: number[]     // 0=Sun … 6=Sat
  preferredTime: string       // 'HH:MM'
  isActive: boolean
  lastRunAt?: string
  nextRunAt?: string
  createdAt: string
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
  referrerReward?: string
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
  googleRating?: number
  googleReviewCount?: number
  doctoraliaRating?: number
  doctoraliaReviewCount?: number
  mainKeywordPosition?: number
  mainKeyword?: string
  createdAt: string
}

// ─── Marketing Dashboard ──────────────────────────────────────────────────────

export interface MarketingDashboardKPIs {
  clinicId: string
  period: string
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  convertedLeads: number
  conversionRate: number
  avgLeadScore: number
  costPerLead?: number
  costPerAcquisition?: number
  totalAdSpend?: number
  estimatedRevenue?: number
  roi?: number
  topSources: { source: LeadSource; leads: number; conversions: number }[]
  campaignPerformance: { campaignId: string; name: string; leads: number; spend: number; roas: number }[]
  funnelStats: { step: string; entered: number; completed: number; rate: number }[]
  reviewStats: { avgRating: number; totalReviews: number; newReviews: number }
  socialStats: { platform: SocialPlatform; posts: number; reach: number; engagement: number }[]
}
