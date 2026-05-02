import { z } from 'zod'

// ─── Lead ─────────────────────────────────────────────────────────────────────

const utmSchema = z.object({
  source:   z.string().optional(),
  medium:   z.string().optional(),
  campaign: z.string().optional(),
  term:     z.string().optional(),
  content:  z.string().optional(),
}).optional()

export const createLeadSchema = z.object({
  name:        z.string().min(1).max(200).trim(),
  email:       z.string().email().optional(),
  phone:       z.string().min(7).max(20).optional(),
  source: z.enum([
    'google-organic', 'google-ads', 'facebook', 'instagram', 'tiktok',
    'email-campaign', 'whatsapp', 'referral-patient', 'referral-doctor',
    'walk-in', 'phone', 'website-form', 'doctoralia', 'topdoctors', 'other',
  ]),
  interestedIn:  z.array(z.string()).max(10).optional(),
  estimatedValue: z.number().positive().optional(),
  campaignId:    z.string().uuid().optional(),
  funnelId:      z.string().uuid().optional(),
  landingPageId: z.string().uuid().optional(),
  assignedTo:    z.string().optional(),
  utm:           utmSchema,
  notes:         z.string().max(1000).optional(),
})

export const updateLeadSchema = z.object({
  name:           z.string().min(1).max(200).trim().optional(),
  email:          z.string().email().optional(),
  phone:          z.string().min(7).max(20).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'appointment-scheduled', 'converted', 'nurturing', 'lost']).optional(),
  interestedIn:   z.array(z.string()).max(10).optional(),
  estimatedValue: z.number().positive().optional(),
  assignedTo:     z.string().optional(),
  notes:          z.string().max(1000).optional(),
  lastContactedAt: z.string().datetime({ offset: true }).optional(),
})

// ─── Campaign ─────────────────────────────────────────────────────────────────

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  type: z.enum([
    'seo', 'sem-google', 'sem-bing', 'facebook-ads', 'instagram-ads',
    'email', 'whatsapp', 'sms', 'referral', 'organic-social', 'pr',
  ]),
  objective: z.enum([
    'brand-awareness', 'lead-generation', 'appointment-booking',
    'patient-retention', 'treatment-promotion',
  ]).optional(),
  budget:    z.number().positive().optional(),
  currency:  z.string().length(3).default('EUR'),
  startDate: z.string().datetime({ offset: true }),
  endDate:   z.string().datetime({ offset: true }).optional(),
  notes:     z.string().max(1000).optional(),
})

export const trackMetricSchema = z.object({
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  impressions: z.number().int().nonnegative().optional(),
  clicks:      z.number().int().nonnegative().optional(),
  leads:       z.number().int().nonnegative().optional(),
  conversions: z.number().int().nonnegative().optional(),
  spend:       z.number().nonnegative().optional(),
  ctr:         z.number().min(0).max(1).optional(),
  cpc:         z.number().nonnegative().optional(),
  cpa:         z.number().nonnegative().optional(),
  roas:        z.number().nonnegative().optional(),
})

// ─── SEO Page ─────────────────────────────────────────────────────────────────

export const createSeoPageSchema = z.object({
  slug:            z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  title:           z.string().min(1).max(200),
  metaTitle:       z.string().min(1).max(60),
  metaDescription: z.string().min(1).max(160),
  h1:              z.string().min(1).max(200),
  keywords:        z.array(z.string()).min(1).max(20),
  locale:          z.string().default('es'),
  treatment: z.enum([
    'implantes-dentales', 'ortodoncia-invisible', 'blanqueamiento-dental',
    'protesis-dental', 'empastes', 'endodoncia', 'periodoncia', 'cirugia-oral',
    'odontopediatria', 'estetica-dental', 'brackets', 'carillas-porcelana', 'urgencias-dentales',
  ]).optional(),
  city:            z.string().optional(),
  canonicalUrl:    z.string().url().optional(),
  ogImage:         z.string().url().optional(),
  structuredDataType: z.enum(['LocalBusiness', 'MedicalBusiness', 'Dentist', 'Service', 'FAQPage']).default('Dentist'),
  isIndexed:       z.boolean().default(true),
  contentBlocks:   z.array(z.object({
    type:    z.enum(['hero', 'faq', 'benefits', 'testimonials', 'cta', 'text', 'team', 'gallery']),
    heading: z.string().optional(),
    content: z.string(),
    items:   z.array(z.string()).optional(),
  })).default([]),
})

// ─── Google Ads ───────────────────────────────────────────────────────────────

const keywordSchema = z.object({
  text:       z.string().min(1).max(80),
  matchType:  z.enum(['broad', 'phrase', 'exact']),
  bidCents:   z.number().int().positive().optional(),
})

const responsiveAdSchema = z.object({
  finalUrl:      z.string().url(),
  headlines:     z.array(z.string().max(30)).min(3).max(15),
  descriptions:  z.array(z.string().max(90)).min(2).max(4),
  callExtension: z.string().optional(),
  displayUrl:    z.string().optional(),
})

const adGroupSchema = z.object({
  name:     z.string().min(1).max(255),
  keywords: z.array(keywordSchema).min(1),
  ads:      z.array(responsiveAdSchema).min(1),
  cpcBidCents: z.number().int().positive().optional(),
})

export const createGoogleAdsCampaignSchema = z.object({
  campaignId:     z.string().uuid(),
  name:           z.string().min(1).max(255),
  network:        z.enum(['search', 'display', 'shopping', 'performance-max', 'demand-gen']),
  bidStrategy:    z.enum(['maximize-clicks', 'target-cpa', 'target-roas', 'maximize-conversions', 'manual-cpc']),
  dailyBudgetCents: z.number().int().positive(),
  currency:       z.string().length(3).default('EUR'),
  targetCpaCents: z.number().int().positive().optional(),
  targetRoas:     z.number().positive().optional(),
  geotargets:     z.array(z.string()).min(1),
  languages:      z.array(z.string()).min(1).default(['es']),
  adGroups:       z.array(adGroupSchema).min(1),
  startDate:      z.string().datetime({ offset: true }),
  endDate:        z.string().datetime({ offset: true }).optional(),
})

// ─── Meta Ads ─────────────────────────────────────────────────────────────────

const metaLocationSchema = z.object({
  type: z.enum(['city', 'region', 'country', 'zip']),
  name: z.string(),
  key:  z.string().optional(),
})

const metaAudienceSchema = z.object({
  ageMin:           z.number().int().min(18).max(65).optional(),
  ageMax:           z.number().int().min(18).max(65).optional(),
  genders:          z.array(z.enum(['male', 'female', 'all'])).optional(),
  locations:        z.array(metaLocationSchema).min(1),
  interests:        z.array(z.string()).optional(),
  behaviors:        z.array(z.string()).optional(),
  customAudiences:  z.array(z.string()).optional(),
  lookalikeSources: z.array(z.string()).optional(),
  radiusKm:         z.number().positive().optional(),
})

const metaAdSchema = z.object({
  name:            z.string().min(1),
  format:          z.enum(['image', 'video', 'carousel', 'collection', 'instant_experience']),
  primaryText:     z.string().min(1).max(500),
  headline:        z.string().max(40).optional(),
  description:     z.string().max(30).optional(),
  callToAction:    z.enum(['CONTACT_US', 'LEARN_MORE', 'SIGN_UP', 'CALL_NOW', 'GET_OFFER', 'BOOK_TRAVEL', 'SEND_MESSAGE']),
  imageUrl:        z.string().url().optional(),
  videoUrl:        z.string().url().optional(),
  landingPageUrl:  z.string().url(),
})

const metaAdSetSchema = z.object({
  name:             z.string().min(1),
  targeting:        metaAudienceSchema,
  placements:       z.array(z.enum(['facebook_feed', 'instagram_feed', 'instagram_stories', 'facebook_stories', 'audience_network', 'reels'])),
  dailyBudgetCents: z.number().int().positive().optional(),
  ads:              z.array(metaAdSchema).min(1),
})

export const createMetaCampaignSchema = z.object({
  campaignId:          z.string().uuid(),
  name:                z.string().min(1).max(255),
  objective:           z.enum(['AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'APP_PROMOTION', 'SALES']),
  dailyBudgetCents:    z.number().int().positive().optional(),
  lifetimeBudgetCents: z.number().int().positive().optional(),
  currency:            z.string().length(3).default('EUR'),
  adSets:              z.array(metaAdSetSchema).min(1),
  startDate:           z.string().datetime({ offset: true }),
  endDate:             z.string().datetime({ offset: true }).optional(),
  pixelId:             z.string().optional(),
})

// ─── Landing Page ─────────────────────────────────────────────────────────────

const landingFormFieldSchema = z.object({
  name:        z.string().min(1),
  label:       z.string().min(1),
  type:        z.enum(['text', 'email', 'phone', 'select', 'textarea', 'checkbox']),
  required:    z.boolean(),
  options:     z.array(z.string()).optional(),
  placeholder: z.string().optional(),
})

export const createLandingPageSchema = z.object({
  slug:         z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  title:        z.string().min(1).max(200),
  template: z.enum([
    'implantes-landing', 'ortodoncia-landing', 'blanqueamiento-landing',
    'primera-visita-landing', 'urgencias-landing', 'review-collection', 'custom',
  ]),
  headline:     z.string().min(1).max(300),
  subheadline:  z.string().max(500).optional(),
  ctaText:      z.string().min(1).max(100),
  ctaPhone:     z.string().optional(),
  ctaWhatsapp:  z.string().optional(),
  campaignId:   z.string().uuid().optional(),
  ogImage:      z.string().url().optional(),
  isPublished:  z.boolean().default(false),
  sections:     z.array(z.object({
    type:     z.enum(['hero', 'benefits', 'testimonials', 'team', 'gallery', 'faq', 'trust-badges', 'form', 'map', 'pricing']),
    heading:  z.string().optional(),
    content:  z.string().optional(),
    imageUrl: z.string().url().optional(),
  })).default([]),
  formConfig: z.object({
    fields:           z.array(landingFormFieldSchema).min(1),
    submitButtonText: z.string().min(1),
    successMessage:   z.string().min(1),
    redirectUrl:      z.string().url().optional(),
    webhookUrl:       z.string().url().optional(),
    gdprText:         z.string().optional(),
    requirePhone:     z.boolean().default(true),
    requireEmail:     z.boolean().default(true),
  }),
  seoMeta: z.object({
    metaTitle:       z.string().max(60),
    metaDescription: z.string().max(160),
    keywords:        z.array(z.string()),
  }).optional(),
})

// ─── Funnel ───────────────────────────────────────────────────────────────────

export const createFunnelSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['landing-to-appointment', 'review-collection', 'referral', 'reactivation', 'custom']),
  landingPageId: z.string().uuid().optional(),
  campaignId:    z.string().uuid().optional(),
  isActive:      z.boolean().default(true),
  steps: z.array(z.object({
    sequence:     z.number().int().positive(),
    type:         z.enum(['landing', 'form', 'email', 'whatsapp', 'sms', 'appointment', 'wait', 'condition']),
    name:         z.string().min(1),
    config:       z.record(z.string(), z.unknown()).default({}),
    delayMinutes: z.number().int().nonnegative().optional(),
    condition:    z.string().optional(),
  })).min(1),
})

export const funnelSubmitSchema = z.object({
  data:      z.record(z.string(), z.string()),
  utm:       utmSchema,
  referrer:  z.string().url().optional(),
})

// ─── Social Post ──────────────────────────────────────────────────────────────

export const createSocialPostSchema = z.object({
  platforms: z.array(z.enum(['instagram', 'facebook', 'tiktok', 'google-business', 'twitter'])).min(1),
  caption:   z.string().min(1).max(2200),
  hashtags:  z.array(z.string()).max(30).default([]),
  mediaUrls: z.array(z.string().url()).max(10).default([]),
  firstComment:  z.string().max(2200).optional(),
  scheduledAt:   z.string().datetime({ offset: true }).optional(),
  campaignId:    z.string().uuid().optional(),
})

export const createSocialScheduleSchema = z.object({
  name:          z.string().min(1).max(200),
  platforms:     z.array(z.enum(['instagram', 'facebook', 'tiktok', 'google-business', 'twitter'])).min(1),
  frequency:     z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  preferredDays: z.array(z.number().int().min(0).max(6)).min(1),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  isActive:      z.boolean().default(true),
})

// ─── Review ───────────────────────────────────────────────────────────────────

export const createReviewRequestSchema = z.object({
  patientId: z.string().uuid(),
  channel:   z.enum(['google-business', 'doctoralia', 'topdoctors', 'trustpilot', 'facebook', 'email', 'whatsapp']),
})

// ─── Referral ─────────────────────────────────────────────────────────────────

export const createReferralProgramSchema = z.object({
  name:           z.string().min(1).max(200),
  isActive:       z.boolean().default(true),
  referrerReward: z.string().max(500).optional(),
  refereeReward:  z.string().max(500).optional(),
  validFrom:      z.string().datetime({ offset: true }),
  validUntil:     z.string().datetime({ offset: true }).optional(),
  maxUses:        z.number().int().positive().optional(),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateLeadInput             = z.infer<typeof createLeadSchema>
export type UpdateLeadInput             = z.infer<typeof updateLeadSchema>
export type CreateCampaignInput         = z.infer<typeof createCampaignSchema>
export type TrackMetricInput            = z.infer<typeof trackMetricSchema>
export type CreateSeoPageInput          = z.infer<typeof createSeoPageSchema>
export type CreateGoogleAdsCampaignInput = z.infer<typeof createGoogleAdsCampaignSchema>
export type CreateMetaCampaignInput     = z.infer<typeof createMetaCampaignSchema>
export type CreateLandingPageInput      = z.infer<typeof createLandingPageSchema>
export type CreateFunnelInput           = z.infer<typeof createFunnelSchema>
export type FunnelSubmitInput           = z.infer<typeof funnelSubmitSchema>
export type CreateSocialPostInput       = z.infer<typeof createSocialPostSchema>
export type CreateSocialScheduleInput   = z.infer<typeof createSocialScheduleSchema>
export type CreateReviewRequestInput    = z.infer<typeof createReviewRequestSchema>
export type CreateReferralProgramInput  = z.infer<typeof createReferralProgramSchema>
