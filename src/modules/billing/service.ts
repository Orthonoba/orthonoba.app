import type { Invoice, Payment, Quote, CreditNote, Subscription } from '@/src/types/billing'
import type { PlanTier } from '@/src/types/clinic'

export interface BillingFilters {
  status?: Invoice['status'] | Quote['status']
  patientId?: string
  orderId?: string
  page?: number
  limit?: number
}

export interface IBillingService {
  // Invoices
  getInvoice(clinicId: string, invoiceId: string): Promise<Invoice | null>
  listInvoices(clinicId: string, filters?: BillingFilters): Promise<{ data: Invoice[]; total: number }>
  createInvoice(clinicId: string, data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Promise<Invoice>
  updateInvoiceStatus(clinicId: string, invoiceId: string, status: Invoice['status']): Promise<Invoice>
  voidInvoice(clinicId: string, invoiceId: string, reason: string): Promise<Invoice>

  // Quotes
  getQuote(clinicId: string, quoteId: string): Promise<Quote | null>
  listQuotes(clinicId: string, filters?: BillingFilters): Promise<{ data: Quote[]; total: number }>
  createQuote(clinicId: string, data: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>): Promise<Quote>
  acceptQuote(clinicId: string, quoteId: string): Promise<{ quote: Quote; invoice: Invoice }>
  rejectQuote(clinicId: string, quoteId: string): Promise<Quote>

  // Payments
  recordPayment(clinicId: string, invoiceId: string, data: Omit<Payment, 'id' | 'clinicId' | 'invoiceId' | 'createdAt'>): Promise<Payment>

  // Credit notes
  issueCreditNote(clinicId: string, invoiceId: string, reason: CreditNote['reason'], lines?: CreditNote['lines']): Promise<CreditNote>

  // SaaS subscriptions
  getSubscription(clinicId: string): Promise<Subscription | null>
  upgradePlan(clinicId: string, newPlan: PlanTier): Promise<Subscription>
  cancelSubscription(clinicId: string): Promise<Subscription>

  // Invoice numbering
  generateInvoiceNumber(clinicId: string): Promise<string>
  generateQuoteNumber(clinicId: string): Promise<string>
}
