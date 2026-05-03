import type Stripe from 'stripe'
import { stripe } from './index'
import {
  upsertSubscription,
  getSubscriptionByStripeId,
  cancelTenantSubscription,
} from '@/src/modules/billing/subscription-store'
import type { PlanTier } from '@/src/types/clinic'
import type { BillingCycle, SubscriptionStatus } from '@/src/types/billing'

// ─── Signature verification ───────────────────────────────────────────────────

export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set.')
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// ─── Event handler map ────────────────────────────────────────────────────────

export type StripeEventHandler = (event: Stripe.Event) => Promise<void>

export const STRIPE_WEBHOOK_HANDLERS: Partial<Record<Stripe.Event['type'], StripeEventHandler>> = {
  'customer.subscription.created':         handleSubscriptionCreated,
  'customer.subscription.updated':         handleSubscriptionUpdated,
  'customer.subscription.deleted':         handleSubscriptionDeleted,
  'customer.subscription.paused':          handleSubscriptionPaused,
  'customer.subscription.resumed':         handleSubscriptionResumed,
  'customer.subscription.trial_will_end':  handleTrialWillEnd,
  'invoice.payment_succeeded':             handleInvoicePaymentSucceeded,
  'invoice.payment_failed':                handleInvoicePaymentFailed,
  'invoice.upcoming':                      handleInvoiceUpcoming,
  'invoice.finalized':                     handleInvoiceFinalized,
  'checkout.session.completed':            handleCheckoutCompleted,
  'checkout.session.expired':              handleCheckoutExpired,
  'payment_intent.payment_failed':         handlePaymentIntentFailed,
  'customer.updated':                      handleCustomerUpdated,
  'customer.deleted':                      handleCustomerDeleted,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStripeStatus(status: Stripe.Subscription['status']): SubscriptionStatus {
  const map: Record<Stripe.Subscription['status'], SubscriptionStatus> = {
    trialing:           'trialing',
    active:             'active',
    past_due:           'past_due',
    canceled:           'cancelled',
    unpaid:             'unpaid',
    incomplete:         'incomplete',
    incomplete_expired: 'incomplete_expired',
    paused:             'paused',
  }
  return map[status] ?? 'active'
}

/** In Stripe SDK v22+, period fields moved from Subscription to SubscriptionItem */
function getSubPeriod(sub: Stripe.Subscription) {
  const item = sub.items.data[0]
  return {
    start: item ? new Date(item.current_period_start * 1000).toISOString() : new Date().toISOString(),
    end:   item ? new Date(item.current_period_end   * 1000).toISOString() : new Date().toISOString(),
  }
}

function extractInvoiceTenantId(invoice: Stripe.Invoice): string | undefined {
  // In Stripe SDK v22+, subscription details live in invoice.parent.subscription_details
  if (invoice.parent?.type === 'subscription_details') {
    return invoice.parent.subscription_details?.metadata?.tenantId
  }
  return undefined
}

// ─── Subscription handlers ────────────────────────────────────────────────────

async function handleSubscriptionCreated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription
  const tenantId = sub.metadata.tenantId
  const tenantType = (sub.metadata.tenantType ?? 'clinic') as 'clinic' | 'lab'

  if (!tenantId) {
    console.error('[stripe:webhook] subscription.created — missing tenantId in metadata')
    return
  }

  const { start, end } = getSubPeriod(sub)

  await upsertSubscription({
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    tenantId,
    tenantType,
    plan: (sub.metadata.plan ?? 'starter') as PlanTier,
    billingCycle: (sub.metadata.billingCycle ?? 'monthly') as BillingCycle,
    status: mapStripeStatus(sub.status),
    currentPeriodStart: start,
    currentPeriodEnd: end,
    trialStart: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : undefined,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : undefined,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  })

  console.info('[stripe:webhook] subscription.created', { tenantId, subscriptionId: sub.id })
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription
  const tenantId = sub.metadata.tenantId
  if (!tenantId) return

  const { start, end } = getSubPeriod(sub)

  await upsertSubscription({
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    tenantId,
    tenantType: (sub.metadata.tenantType ?? 'clinic') as 'clinic' | 'lab',
    plan: (sub.metadata.plan ?? 'starter') as PlanTier,
    billingCycle: (sub.metadata.billingCycle ?? 'monthly') as BillingCycle,
    status: mapStripeStatus(sub.status),
    currentPeriodStart: start,
    currentPeriodEnd: end,
    trialStart: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : undefined,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : undefined,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  })

  console.info('[stripe:webhook] subscription.updated', {
    tenantId,
    status: sub.status,
    plan: sub.metadata.plan,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  })
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription
  const tenantId = sub.metadata.tenantId
  if (!tenantId) return

  await cancelTenantSubscription(sub.id, new Date().toISOString())
  console.info('[stripe:webhook] subscription.deleted — tenant downgraded to starter', { tenantId })
}

async function handleSubscriptionPaused(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription
  const existing = await getSubscriptionByStripeId(sub.id)
  if (existing) {
    await upsertSubscription({
      stripeSubscriptionId: sub.id,
      stripeCustomerId: existing.stripeCustomerId!,
      tenantId: existing.tenantId,
      tenantType: existing.tenantType,
      plan: existing.plan,
      billingCycle: existing.billingCycle,
      status: 'paused',
      currentPeriodStart: existing.currentPeriodStart,
      currentPeriodEnd: existing.currentPeriodEnd,
      cancelAtPeriodEnd: existing.cancelAtPeriodEnd,
    })
  }
  console.info('[stripe:webhook] subscription.paused', { tenantId: sub.metadata.tenantId })
}

async function handleSubscriptionResumed(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription
  const existing = await getSubscriptionByStripeId(sub.id)
  if (existing) {
    const { start, end } = getSubPeriod(sub)
    await upsertSubscription({
      stripeSubscriptionId: sub.id,
      stripeCustomerId: existing.stripeCustomerId!,
      tenantId: existing.tenantId,
      tenantType: existing.tenantType,
      plan: existing.plan,
      billingCycle: existing.billingCycle,
      status: 'active',
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    })
  }
  console.info('[stripe:webhook] subscription.resumed', { tenantId: sub.metadata.tenantId })
}

async function handleTrialWillEnd(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
  // TODO: send trial-ending notification email to tenant admin
  console.info('[stripe:webhook] trial_will_end in ~3 days', { tenantId: sub.metadata.tenantId, trialEnd })
}

// ─── Invoice handlers ─────────────────────────────────────────────────────────

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  const tenantId = extractInvoiceTenantId(invoice)
  // TODO: mark platform invoice as paid + trigger receipt email
  console.info('[stripe:webhook] invoice.payment_succeeded', {
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
    tenantId,
  })
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  const tenantId = extractInvoiceTenantId(invoice)
  // TODO: notify tenant admin + start dunning process
  console.warn('[stripe:webhook] invoice.payment_failed — dunning triggered', {
    invoiceId: invoice.id,
    attemptCount: invoice.attempt_count,
    nextAttempt: invoice.next_payment_attempt,
    tenantId,
  })
}

async function handleInvoiceUpcoming(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  const tenantId = extractInvoiceTenantId(invoice)
  // TODO: send upcoming invoice notification (7 days before renewal)
  console.info('[stripe:webhook] invoice.upcoming', {
    amount: invoice.amount_due,
    dueDate: invoice.due_date,
    tenantId,
  })
}

async function handleInvoiceFinalized(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  // TODO: store Stripe invoice reference in platform DB for billing history
  console.info('[stripe:webhook] invoice.finalized', {
    invoiceId: invoice.id,
    hostedUrl: invoice.hosted_invoice_url,
  })
}

// ─── Checkout handlers ────────────────────────────────────────────────────────

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session
  const { tenantId, plan, billingCycle } = session.metadata ?? {}

  if (!tenantId || !plan) {
    console.error('[stripe:webhook] checkout.completed — missing metadata', { metadata: session.metadata })
    return
  }

  // TODO: activate subscription, send welcome email, provision features
  console.info('[stripe:webhook] checkout.session.completed', { tenantId, plan, billingCycle })
}

async function handleCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session
  console.info('[stripe:webhook] checkout.session.expired', { sessionId: session.id })
}

// ─── Payment intent handlers ──────────────────────────────────────────────────

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const pi = event.data.object as Stripe.PaymentIntent
  console.warn('[stripe:webhook] payment_intent.payment_failed', {
    paymentIntentId: pi.id,
    lastError: pi.last_payment_error?.message,
    tenantId: pi.metadata.tenantId,
  })
}

// ─── Customer handlers ────────────────────────────────────────────────────────

async function handleCustomerUpdated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer
  // TODO: sync email / name changes to platform tenant record
  console.info('[stripe:webhook] customer.updated', {
    customerId: customer.id,
    tenantId: customer.metadata.tenantId,
  })
}

async function handleCustomerDeleted(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer
  // TODO: handle GDPR-driven customer deletion
  console.warn('[stripe:webhook] customer.deleted', {
    customerId: customer.id,
    tenantId: customer.metadata.tenantId,
  })
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function dispatchWebhookEvent(event: Stripe.Event): Promise<void> {
  const handler = STRIPE_WEBHOOK_HANDLERS[event.type]
  if (handler) {
    await handler(event)
  } else {
    console.info('[stripe:webhook] unhandled event type:', event.type)
  }
}
