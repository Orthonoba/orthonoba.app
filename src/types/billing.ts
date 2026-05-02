import type { PlanTier } from '@/src/types/clinic'

// ─── Financial Primitives ─────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'direct-debit' | 'financing' | 'other'

/** ISO 4217 currency codes supported by Orthonoba */
export type Currency = 'EUR' | 'USD' | 'GBP'

// ─── Tax Configuration ────────────────────────────────────────────────────────

export interface TaxRate {
  id: string
  clinicId: string
  name: string
  /** E.g. 'IVA 21%', 'IVA Reducido 10%', 'Exento' */
  label: string
  /** Percentage value, e.g. 21.0 */
  rate: number
  isDefault: boolean
  isActive: boolean
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
  /** VAT / tax percentage (e.g. 21 for 21% IVA) */
  taxPercent: number
  taxAmount: number
  total: number
}

export interface Invoice {
  id: string
  clinicId: string
  patientId?: string
  orderId?: string
  /** Sequential human-readable number, e.g. 'ORN-2024-0001' */
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
  /** Original invoice being corrected */
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
  /** Sequential reference number, e.g. 'PRE-2024-0001' */
  quoteNumber: string
  status: QuoteStatus
  currency: Currency
  lines: InvoiceLine[]
  subtotal: number
  taxTotal: number
  total: number
  /** ISO date after which the quote is no longer valid */
  validUntil: string
  acceptedAt?: string
  rejectedAt?: string
  /** When accepted, references the generated invoice */
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
  /** External reference: bank transfer ID, card last 4, Stripe charge ID */
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
  | 'past-due'
  | 'cancelled'
  | 'expired'

export interface Subscription {
  id: string
  clinicId: string
  plan: PlanTier
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  cancelledAt?: string
  createdAt: string
  updatedAt?: string
}
