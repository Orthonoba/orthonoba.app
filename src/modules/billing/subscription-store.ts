import type { Subscription, SubscriptionStatus, BillingCycle } from '@/src/types/billing'
import type { PlanTier, TenantType } from '@/src/types/clinic'

// ─── In-memory store (replace with Neon DB queries) ──────────────────────────

const store = new Map<string, Subscription>()

export interface UpsertSubscriptionInput {
  stripeSubscriptionId: string
  stripeCustomerId: string
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
  couponCode?: string
  discountPercent?: number
}

export async function upsertSubscription(input: UpsertSubscriptionInput): Promise<Subscription> {
  const now = new Date().toISOString()
  const existing = store.get(input.stripeSubscriptionId)

  const subscription: Subscription = {
    id: existing?.id ?? crypto.randomUUID(),
    tenantId: input.tenantId,
    tenantType: input.tenantType,
    plan: input.plan,
    billingCycle: input.billingCycle,
    status: input.status,
    currentPeriodStart: input.currentPeriodStart,
    currentPeriodEnd: input.currentPeriodEnd,
    trialStart: input.trialStart,
    trialEnd: input.trialEnd,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd,
    stripeSubscriptionId: input.stripeSubscriptionId,
    stripeCustomerId: input.stripeCustomerId,
    couponCode: input.couponCode,
    discountPercent: input.discountPercent,
    cancelledAt: existing?.cancelledAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  store.set(input.stripeSubscriptionId, subscription)
  return subscription
}

export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  return store.get(stripeSubscriptionId) ?? null
}

export async function getSubscriptionByTenantId(
  tenantId: string
): Promise<Subscription | null> {
  for (const sub of store.values()) {
    if (sub.tenantId === tenantId) return sub
  }
  return null
}

export async function cancelTenantSubscription(
  stripeSubscriptionId: string,
  cancelledAt: string
): Promise<Subscription | null> {
  const sub = store.get(stripeSubscriptionId)
  if (!sub) return null

  const cancelled: Subscription = {
    ...sub,
    status: 'cancelled',
    cancelledAt,
    plan: 'starter',
    updatedAt: new Date().toISOString(),
  }

  store.set(stripeSubscriptionId, cancelled)
  return cancelled
}

export async function listSubscriptions(
  limit = 20,
  offset = 0
): Promise<{ data: Subscription[]; total: number }> {
  const all = Array.from(store.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return {
    data: all.slice(offset, offset + limit),
    total: all.length,
  }
}
