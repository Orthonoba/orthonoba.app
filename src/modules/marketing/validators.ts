import { z } from 'zod'

export const createLeadSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
  source: z.enum([
    'google-organic', 'google-ads', 'facebook', 'instagram', 'tiktok',
    'email-campaign', 'whatsapp', 'referral-patient', 'referral-doctor',
    'walk-in', 'phone', 'website-form', 'doctoralia', 'topdoctors', 'other',
  ]),
  interestedIn: z.array(z.string()).max(10).optional(),
  campaignId: z.string().uuid().optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  notes: z.string().max(1000).optional(),
})

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
  budget: z.number().positive().optional(),
  currency: z.string().length(3).default('EUR'),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }).optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
