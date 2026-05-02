import { stripe } from './index'
import type { PlanTier } from '@/src/types/clinic'

const PRICE_IDS: Record<PlanTier, string | undefined> = {
  free: process.env.STRIPE_PRICE_FREE,
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export async function getOrCreateCustomer(
  clinicId: string,
  email: string,
  name: string
): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { clinicId },
  })

  return customer.id
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function createCheckoutSession(params: {
  clinicId: string
  customerId: string
  plan: PlanTier
  successUrl: string
  cancelUrl: string
}) {
  const priceId = PRICE_IDS[params.plan]
  if (!priceId) throw new Error(`No price ID configured for plan: ${params.plan}`)

  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { clinicId: params.clinicId },
    subscription_data: {
      metadata: { clinicId: params.clinicId },
      trial_period_days: params.plan === 'pro' ? 14 : undefined,
    },
    allow_promotion_codes: true,
  })
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// ─── Subscription management ──────────────────────────────────────────────────

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
}

export async function resumeSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false })
}

// ─── Invoice helpers ──────────────────────────────────────────────────────────

export async function listInvoices(customerId: string) {
  return stripe.invoices.list({ customer: customerId, limit: 12 })
}
