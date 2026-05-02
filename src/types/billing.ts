import type { PlanTier, TenantType } from '@/src/types/clinic'

// ─── Financial Primitives ─────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'direct-debit' | 'financing' | 'other'

/** ISO 4217 currency codes supported by Orthonoba */
export type Currency = 'EUR' | 'USD' | 'GBP'

export type BillingCycle = 'monthly' | 'annual' | 'quarterly'

// ─── Tax Configuration ────────────────────────────────────────────────────────

export interface TaxRate {
  id: string
  clinicId: string
  name: string
  label: string
  rate: number
  isDefault: boolean
  isActive: boolean
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
  taxAmount: number
  total: number
}

export interface Invoice {
  id: string
  clinicId: string
  patientId?: string
  orderId?: string
  invoiceNumber: string
  status: InvoiceStatus
  currency: Currency
  lines: InvoiceLine[]
  subtotal: number
  taxTotal: number
  total: number
  issuedAt: string
  dueAt: string
  paidAt?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Credit Note (Factura Rectificativa) ──────────────────────────────────────

export type CreditNoteReason =
  | 'cancellation'
  | 'partial-refund'
  | 'pricing-error'
  | 'treatment-not-performed'
  | 'other'

export interface CreditNote {
  id: string
  clinicId: string
  invoiceId: string
  creditNoteNumber: string
  reason: CreditNoteReason
  currency: Currency
  lines: InvoiceLine[]
  subtotal: number
  taxTotal: number
  total: number
  issuedAt: string
  notes?: string
  createdAt: string
}

// ─── Quote / Estimate (Presupuesto) ──────────────────────────────────────────

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface Quote {
  id: string
  clinicId: string
  patientId: string
  quoteNumber: string
  status: QuoteStatus
  currency: Currency
  lines: InvoiceLine[]
  subtotal: number
  taxTotal: number
  total: number
  validUntil: string
  acceptedAt?: string
  rejectedAt?: string
  invoiceId?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string
  invoiceId: string
  clinicId: string
  method: PaymentMethod
  amount: number
  currency: Currency
  reference?: string
  paidAt: string
  createdAt: string
}

// ─── Payment Link ─────────────────────────────────────────────────────────────

export type PaymentLinkStatus = 'active' | 'paid' | 'expired' | 'cancelled'

export interface PaymentLink {
  id: string
  clinicId: string
  invoiceId: string
  amount: number
  currency: Currency
  status: PaymentLinkStatus
  url: string
  expiresAt?: string
  paidAt?: string
  stripePaymentIntentId?: string
  createdAt: string
}

// ─── SaaS Platform Subscription ───────────────────────────────────────────────

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired'
  | 'paused'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'

export interface Subscription {
  id: string
  /** clinicId or labId */
  tenantId: string
  tenantType: TenantType
  plan: PlanTier
  billingCycle: BillingCycle
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  trialStart?: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  cancelledAt?: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  stripePriceId?: string
  /** Applied coupon code */
  couponCode?: string
  /** Discount % applied (0–100) */
  discountPercent?: number
  /** Scheduled plan change at next renewal */
  scheduledPlan?: PlanTier
  scheduledBillingCycle?: BillingCycle
  createdAt: string
  updatedAt?: string
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export type CouponType = 'percent_off' | 'amount_off'
export type CouponDuration = 'once' | 'repeating' | 'forever'

export interface Coupon {
  id: string
  code: string
  name: string
  type: CouponType
  /** Percentage discount (1–100) — mutually exclusive with amountOff */
  percentOff?: number
  /** Fixed discount in smallest currency unit — mutually exclusive with percentOff */
  amountOff?: number
  currency?: Currency
  duration: CouponDuration
  /** Months active when duration = 'repeating' */
  durationInMonths?: number
  /** Max redemptions across all customers */
  maxRedemptions?: number
  timesRedeemed: number
  /** Applicable plans (empty = all plans) */
  applicablePlans: PlanTier[]
  isActive: boolean
  expiresAt?: string
  stripeCouponId?: string
  stripePromotionCodeId?: string
  createdAt: string
}

export interface CouponValidation {
  valid: boolean
  coupon?: Pick<Coupon, 'id' | 'code' | 'type' | 'percentOff' | 'amountOff' | 'duration' | 'durationInMonths'>
  errorCode?: 'COUPON_NOT_FOUND' | 'COUPON_EXPIRED' | 'COUPON_INVALID' | 'COUPON_MAX_REDEMPTIONS' | 'COUPON_PLAN_MISMATCH'
  message?: string
}

// ─── ORTHONOBA Token (credits for AI/CAD features) ────────────────────────────

export type TokenTransactionType =
  | 'allocation'      // monthly plan allocation
  | 'consumption'     // feature use (CAD, AI analysis, etc.)
  | 'purchase'        // top-up purchase
  | 'refund'          // reversed consumption
  | 'expiry'          // unused tokens expired

export interface TokenBalance {
  tenantId: string
  tenantType: TenantType
  /** Current usable balance */
  balance: number
  /** Monthly allocation for current plan */
  monthlyAllocation: number
  /** Tokens consumed current month */
  usedThisMonth: number
  /** Tokens purchased (never expire) */
  purchasedBalance: number
  periodStart: string
  periodEnd: string
  updatedAt: string
}

export interface TokenTransaction {
  id: string
  tenantId: string
  type: TokenTransactionType
  amount: number
  /** Positive = credit, negative = debit */
  balanceAfter: number
  description: string
  referenceId?: string
  createdAt: string
}

// ─── Subscription Schedule (pending plan changes) ─────────────────────────────

export interface SubscriptionSchedule {
  id: string
  tenantId: string
  currentPlan: PlanTier
  scheduledPlan: PlanTier
  scheduledBillingCycle: BillingCycle
  /** ISO date when change takes effect (next renewal) */
  effectiveAt: string
  stripeScheduleId?: string
  createdAt: string
}

// ─── Billing Portal Session ───────────────────────────────────────────────────

export interface BillingPortalSession {
  url: string
  expiresAt: string
}

// ─── Usage Record (for metered billing) ───────────────────────────────────────

export type UsageFeature =
  | 'cad_design'
  | 'ai_analysis'
  | 'sms_notification'
  | 'api_call'
  | 'storage_gb'
  | 'token_consumption'

export interface UsageRecord {
  id: string
  tenantId: string
  feature: UsageFeature
  quantity: number
  unitCost?: number
  periodStart: string
  periodEnd: string
  stripeUsageRecordId?: string
  recordedAt: string
}
