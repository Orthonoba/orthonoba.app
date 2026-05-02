import type { PlanTier, TenantType } from '@/src/types/clinic'
import type { BillingCycle } from '@/src/types/billing'

// ─── Plan Feature Limits ──────────────────────────────────────────────────────

export interface PlanLimits {
  /** Max active users in the tenant */
  maxUsers: number
  /** Max dental orders per month (-1 = unlimited) */
  maxOrdersPerMonth: number
  /** Max active patients / lab cases (-1 = unlimited) */
  maxRecords: number
  /** Storage quota in GB */
  storageGb: number
  /** Monthly ORTHONOBA token allocation */
  tokensPerMonth: number
  /** Max clinic locations / lab branches (-1 = unlimited) */
  maxLocations: number
  /** API calls per day (-1 = unlimited) */
  apiCallsPerDay: number
}

export interface PlanFeatures {
  cad: boolean
  aiAnalysis: boolean
  customBranding: boolean
  advancedReports: boolean
  labIntegration: boolean
  marketingModule: boolean
  webhooks: boolean
  ssoSaml: boolean
  dedicatedSupport: boolean
  whiteLabel: boolean
  customContracts: boolean
  uptimeSla: boolean
  /** API access for external integrations */
  apiAccess: boolean
  /** Priority queue in lab production */
  priorityQueue: boolean
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PlanPricing {
  /** Monthly price in EUR cents */
  monthly: number
  /** Annual price in EUR cents (total for 12 months, not monthly) */
  annual: number
  /** Annual price per month (annual / 12, rounded) */
  annualPerMonth: number
  /** Annual discount percentage */
  annualDiscountPercent: number
  currency: 'EUR'
  /** true = contact sales */
  custom: boolean
}

// ─── Plan Config ──────────────────────────────────────────────────────────────

export interface PlanConfig {
  id: PlanTier
  name: string
  tagline: string
  pricing: PlanPricing
  limits: PlanLimits
  features: PlanFeatures
  /** Plans this tier can upgrade to */
  upgradableTo: PlanTier[]
  /** highlight for pricing page */
  highlighted: boolean
  /** Applicable tenant types */
  tenantTypes: TenantType[]
  /** Trial period in days (0 = no trial) */
  trialDays: number
}

// ─── Stripe Price IDs (resolved from env at runtime) ─────────────────────────

export interface StripePriceIds {
  monthly: string
  annual: string
}

export function getStripePriceIds(plan: PlanTier): StripePriceIds {
  const keys: Record<PlanTier, { monthly: string; annual: string }> = {
    starter: {
      monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
      annual: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? '',
    },
    growth: {
      monthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY ?? '',
      annual: process.env.STRIPE_PRICE_GROWTH_ANNUAL ?? '',
    },
    scale: {
      monthly: process.env.STRIPE_PRICE_SCALE_MONTHLY ?? '',
      annual: process.env.STRIPE_PRICE_SCALE_ANNUAL ?? '',
    },
    enterprise: {
      monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
      annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? '',
    },
  }
  return keys[plan]
}

export function getStripePriceId(plan: PlanTier, cycle: BillingCycle): string {
  if (cycle === 'quarterly') {
    // quarterly falls back to monthly price × 3, handled at checkout level
    return getStripePriceIds(plan).monthly
  }
  return cycle === 'annual'
    ? getStripePriceIds(plan).annual
    : getStripePriceIds(plan).monthly
}

// ─── ORTHONOBA Token Allocations ──────────────────────────────────────────────
// Tokens are consumed for AI-assisted CAD, analytics, and platform API calls.

export const TOKEN_ALLOCATIONS: Record<PlanTier, number> = {
  starter: 500,
  growth: 2_000,
  scale: 8_000,
  enterprise: -1, // unlimited
}

export const TOKEN_TOP_UP_PACKS = [
  { tokens: 500,   priceEurCents: 2500,  stripePriceId: process.env.STRIPE_PRICE_TOKEN_500  ?? '' },
  { tokens: 2000,  priceEurCents: 8000,  stripePriceId: process.env.STRIPE_PRICE_TOKEN_2000 ?? '' },
  { tokens: 10000, priceEurCents: 30000, stripePriceId: process.env.STRIPE_PRICE_TOKEN_10K  ?? '' },
]

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'Para clínicas que empiezan a digitalizar',
    pricing: {
      monthly: 4900,        // €49/mo
      annual: 47040,        // €3,920/yr  ≈ €326/mo — 20% off
      annualPerMonth: 3920,
      annualDiscountPercent: 20,
      currency: 'EUR',
      custom: false,
    },
    limits: {
      maxUsers: 3,
      maxOrdersPerMonth: 50,
      maxRecords: 200,
      storageGb: 5,
      tokensPerMonth: 500,
      maxLocations: 1,
      apiCallsPerDay: 500,
    },
    features: {
      cad: false,
      aiAnalysis: false,
      customBranding: false,
      advancedReports: false,
      labIntegration: true,
      marketingModule: false,
      webhooks: false,
      ssoSaml: false,
      dedicatedSupport: false,
      whiteLabel: false,
      customContracts: false,
      uptimeSla: false,
      apiAccess: false,
      priorityQueue: false,
    },
    upgradableTo: ['growth', 'scale', 'enterprise'],
    highlighted: false,
    tenantTypes: ['clinic'],
    trialDays: 14,
  },

  growth: {
    id: 'growth',
    name: 'Growth',
    tagline: 'Para clínicas y labs en expansión',
    pricing: {
      monthly: 14900,       // €149/mo
      annual: 143040,       // €11,920/yr ≈ €993/mo — 20% off
      annualPerMonth: 11920,
      annualDiscountPercent: 20,
      currency: 'EUR',
      custom: false,
    },
    limits: {
      maxUsers: 10,
      maxOrdersPerMonth: 200,
      maxRecords: 1_000,
      storageGb: 25,
      tokensPerMonth: 2_000,
      maxLocations: 3,
      apiCallsPerDay: 5_000,
    },
    features: {
      cad: true,
      aiAnalysis: false,
      customBranding: true,
      advancedReports: true,
      labIntegration: true,
      marketingModule: true,
      webhooks: true,
      ssoSaml: false,
      dedicatedSupport: false,
      whiteLabel: false,
      customContracts: false,
      uptimeSla: false,
      apiAccess: true,
      priorityQueue: false,
    },
    upgradableTo: ['scale', 'enterprise'],
    highlighted: true,
    tenantTypes: ['clinic', 'lab'],
    trialDays: 14,
  },

  scale: {
    id: 'scale',
    name: 'Scale',
    tagline: 'Para grupos dentales y labs profesionales',
    pricing: {
      monthly: 39900,       // €399/mo
      annual: 383040,       // €31,920/yr ≈ €2,660/mo — 20% off
      annualPerMonth: 31920,
      annualDiscountPercent: 20,
      currency: 'EUR',
      custom: false,
    },
    limits: {
      maxUsers: 25,
      maxOrdersPerMonth: -1,
      maxRecords: -1,
      storageGb: 100,
      tokensPerMonth: 8_000,
      maxLocations: -1,
      apiCallsPerDay: 50_000,
    },
    features: {
      cad: true,
      aiAnalysis: true,
      customBranding: true,
      advancedReports: true,
      labIntegration: true,
      marketingModule: true,
      webhooks: true,
      ssoSaml: false,
      dedicatedSupport: true,
      whiteLabel: false,
      customContracts: false,
      uptimeSla: true,
      apiAccess: true,
      priorityQueue: true,
    },
    upgradableTo: ['enterprise'],
    highlighted: false,
    tenantTypes: ['clinic', 'lab'],
    trialDays: 0,
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Solución completa para grandes organizaciones',
    pricing: {
      monthly: 99900,       // €999/mo — published reference price
      annual: 959040,       // €79,920/yr — custom negotiated
      annualPerMonth: 79920,
      annualDiscountPercent: 20,
      currency: 'EUR',
      custom: true,
    },
    limits: {
      maxUsers: -1,
      maxOrdersPerMonth: -1,
      maxRecords: -1,
      storageGb: -1,
      tokensPerMonth: -1,
      maxLocations: -1,
      apiCallsPerDay: -1,
    },
    features: {
      cad: true,
      aiAnalysis: true,
      customBranding: true,
      advancedReports: true,
      labIntegration: true,
      marketingModule: true,
      webhooks: true,
      ssoSaml: true,
      dedicatedSupport: true,
      whiteLabel: true,
      customContracts: true,
      uptimeSla: true,
      apiAccess: true,
      priorityQueue: true,
    },
    upgradableTo: [],
    highlighted: false,
    tenantTypes: ['clinic', 'lab'],
    trialDays: 0,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPlan(tier: PlanTier): PlanConfig {
  return PLANS[tier]
}

export function canUpgradeTo(current: PlanTier, target: PlanTier): boolean {
  return PLANS[current].upgradableTo.includes(target)
}

export function isUnlimited(value: number): boolean {
  return value === -1
}

export function getPlanOrder(): PlanTier[] {
  return ['starter', 'growth', 'scale', 'enterprise']
}

export function isUpgrade(from: PlanTier, to: PlanTier): boolean {
  const order = getPlanOrder()
  return order.indexOf(to) > order.indexOf(from)
}

export function isDowngrade(from: PlanTier, to: PlanTier): boolean {
  const order = getPlanOrder()
  return order.indexOf(to) < order.indexOf(from)
}

export function getAnnualSavings(plan: PlanTier): number {
  const p = PLANS[plan].pricing
  return p.monthly * 12 - p.annual
}

/** Returns all plans available for a given tenant type */
export function getPlansForTenantType(type: TenantType): PlanConfig[] {
  return Object.values(PLANS).filter((p) => p.tenantTypes.includes(type))
}
