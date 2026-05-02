import { z } from 'zod'

// ─── Invoice validators ───────────────────────────────────────────────────────

const invoiceLineSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(9999),
  unitPrice: z.number().nonnegative(),
  taxPercent: z.number().min(0).max(100).default(21),
  taxAmount: z.number().nonnegative(),
  total: z.number().nonnegative(),
})

export const createInvoiceSchema = z.object({
  patientId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  lines: z.array(invoiceLineSchema).min(1),
  dueAt: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional(),
})

export const createQuoteSchema = createInvoiceSchema.extend({
  validUntil: z.string().datetime({ offset: true }),
  patientId: z.string().uuid(),
})

export const recordPaymentSchema = z.object({
  method: z.enum(['cash', 'card', 'transfer', 'direct-debit', 'financing', 'other']),
  amount: z.number().positive(),
  currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  reference: z.string().max(200).optional(),
  paidAt: z.string().datetime({ offset: true }),
})

// ─── SaaS checkout validators ─────────────────────────────────────────────────

export const checkoutSchema = z.object({
  plan: z.enum(['starter', 'growth', 'scale', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  promotionCode: z.string().min(1).max(50).toUpperCase().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export const upgradeSchema = z.object({
  plan: z.enum(['starter', 'growth', 'scale', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  /** Preview proration before committing */
  preview: z.boolean().default(false),
})

export const cancelSchema = z.object({
  /** true = cancel at period end (default), false = cancel immediately */
  atPeriodEnd: z.boolean().default(true),
  reason: z.string().max(500).optional(),
})

// ─── Coupon validators ────────────────────────────────────────────────────────

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  plan: z.enum(['starter', 'growth', 'scale', 'enterprise']).optional(),
})

export const applyCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
})

// ─── Portal validator ─────────────────────────────────────────────────────────

export const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateInvoiceInput      = z.infer<typeof createInvoiceSchema>
export type CreateQuoteInput        = z.infer<typeof createQuoteSchema>
export type RecordPaymentInput      = z.infer<typeof recordPaymentSchema>
export type CheckoutInput           = z.infer<typeof checkoutSchema>
export type UpgradeInput            = z.infer<typeof upgradeSchema>
export type CancelInput             = z.infer<typeof cancelSchema>
export type ValidateCouponInput     = z.infer<typeof validateCouponSchema>
export type ApplyCouponInput        = z.infer<typeof applyCouponSchema>
export type PortalInput             = z.infer<typeof portalSchema>
