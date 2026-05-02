import { z } from 'zod'

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

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
