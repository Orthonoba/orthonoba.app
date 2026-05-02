import Stripe from 'stripe'
import { stripe } from './index'

// ─── Signature verification ───────────────────────────────────────────────────

export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set.')
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// ─── Event handler map ────────────────────────────────────────────────────────
// Wire each event to the appropriate domain handler.

export type StripeEventHandler = (event: Stripe.Event) => Promise<void>

export const STRIPE_WEBHOOK_HANDLERS: Partial<Record<Stripe.Event['type'], StripeEventHandler>> = {
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.payment_succeeded': handleInvoicePaymentSucceeded,
  'invoice.payment_failed': handleInvoicePaymentFailed,
  'checkout.session.completed': handleCheckoutCompleted,
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const clinicId = subscription.metadata.clinicId
  // TODO: update clinic subscription status in DB
  console.warn('[stripe:webhook] subscription.created', { clinicId, subscriptionId: subscription.id })
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const clinicId = subscription.metadata.clinicId
  // TODO: sync plan change to clinic record
  console.warn('[stripe:webhook] subscription.updated', { clinicId, status: subscription.status })
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const clinicId = subscription.metadata.clinicId
  // TODO: downgrade clinic to free plan
  console.warn('[stripe:webhook] subscription.deleted', { clinicId })
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  // TODO: mark subscription invoice as paid
  console.warn('[stripe:webhook] invoice.payment_succeeded', { invoiceId: invoice.id })
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  // TODO: notify clinic admin + start dunning process
  console.warn('[stripe:webhook] invoice.payment_failed', { invoiceId: invoice.id })
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session
  const clinicId = session.metadata?.clinicId
  // TODO: activate subscription, send welcome email
  console.warn('[stripe:webhook] checkout.session.completed', { clinicId })
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function dispatchWebhookEvent(event: Stripe.Event): Promise<void> {
  const handler = STRIPE_WEBHOOK_HANDLERS[event.type]
  if (handler) {
    await handler(event)
  }
}
