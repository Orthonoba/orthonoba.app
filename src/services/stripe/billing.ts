import { stripe } from './index'
import { getStripePriceId, PLANS } from '@/src/config/plans'
import type { PlanTier, TenantType } from '@/src/types/clinic'
import type { BillingCycle, BillingPortalSession } from '@/src/types/billing'

// ─── Customer ─────────────────────────────────────────────────────────────────

export async function getOrCreateCustomer(
  tenantId: string,
  email: string,
  name: string,
  tenantType: TenantType = 'clinic'
): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { tenantId, tenantType },
  })

  return customer.id
}

export async function getCustomerByTenantId(tenantId: string): Promise<string | null> {
  const result = await stripe.customers.search({
    query: `metadata['tenantId']:'${tenantId}'`,
    limit: 1,
  })
  return result.data[0]?.id ?? null
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

interface CheckoutParams {
  tenantId: string
  tenantType: TenantType
  customerId: string
  plan: PlanTier
  billingCycle: BillingCycle
  successUrl: string
  cancelUrl: string
  promotionCode?: string
}

export async function createCheckoutSession(params: CheckoutParams) {
  const priceId = getStripePriceId(params.plan, params.billingCycle)
  if (!priceId) throw new Error(`No Stripe price configured for ${params.plan}/${params.billingCycle}`)

  const planConfig = PLANS[params.plan]
  const trialDays = planConfig.trialDays > 0 ? planConfig.trialDays : undefined

  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    allow_promotion_codes: !params.promotionCode,
    ...(params.promotionCode
      ? { discounts: [{ promotion_code: params.promotionCode }] }
      : {}),
    metadata: {
      tenantId: params.tenantId,
      tenantType: params.tenantType,
      plan: params.plan,
      billingCycle: params.billingCycle,
    },
    subscription_data: {
      metadata: {
        tenantId: params.tenantId,
        tenantType: params.tenantType,
        plan: params.plan,
        billingCycle: params.billingCycle,
      },
      ...(trialDays ? { trial_period_days: trialDays } : {}),
    },
  })
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<BillingPortalSession> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return {
    url: session.url,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  }
}

// ─── Subscription management ──────────────────────────────────────────────────

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product', 'latest_invoice', 'customer'],
  })
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

// ─── Upgrade / Downgrade ──────────────────────────────────────────────────────

interface PlanChangeParams {
  subscriptionId: string
  newPlan: PlanTier
  newBillingCycle: BillingCycle
  /** true = prorate immediately, false = schedule for next period */
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
}

export async function changePlan(params: PlanChangeParams) {
  const priceId = getStripePriceId(params.newPlan, params.newBillingCycle)
  if (!priceId) throw new Error(`No Stripe price configured for ${params.newPlan}/${params.newBillingCycle}`)

  const subscription = await stripe.subscriptions.retrieve(params.subscriptionId)
  const itemId = subscription.items.data[0]?.id
  if (!itemId) throw new Error('Subscription has no items')

  return stripe.subscriptions.update(params.subscriptionId, {
    items: [{ id: itemId, price: priceId }],
    proration_behavior: params.prorationBehavior ?? 'create_prorations',
    metadata: {
      plan: params.newPlan,
      billingCycle: params.newBillingCycle,
    },
  })
}

// ─── Preview proration ────────────────────────────────────────────────────────

export async function previewPlanChange(
  subscriptionId: string,
  newPlan: PlanTier,
  newBillingCycle: BillingCycle
) {
  const priceId = getStripePriceId(newPlan, newBillingCycle)
  if (!priceId) throw new Error(`No Stripe price configured for ${newPlan}/${newBillingCycle}`)

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const itemId = subscription.items.data[0]?.id
  if (!itemId) throw new Error('Subscription has no items')

  return stripe.invoices.createPreview({
    customer: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    subscription: subscriptionId,
    subscription_details: {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: 'create_prorations',
    },
  })
}

// ─── Invoice helpers ──────────────────────────────────────────────────────────

export async function listStripeInvoices(customerId: string, limit = 12) {
  return stripe.invoices.list({ customer: customerId, limit })
}

export async function getUpcomingInvoice(customerId: string, subscriptionId: string) {
  // retrieveUpcoming removed in Stripe API 2026-04-22 — use createPreview
  return stripe.invoices.createPreview({
    customer: customerId,
    subscription: subscriptionId,
  })
}

// ─── Payment Intent ───────────────────────────────────────────────────────────

export async function createPaymentIntent(
  amountCents: number,
  currency: string,
  customerId: string,
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    customer: customerId,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}
