import type { Subscription, SubscriptionStatus, BillingCycle } from '@/src/types/billing'
import type { PlanTier, TenantType } from '@/src/types/clinic'

export interface UpsertSubscriptionInput {
  stripeSubscriptionId: string
  stripeCustomerId: string
  stripePriceId?: string
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

// ─── DB-aware helpers ────────────────────────────────────────────────────────
// Uses Prisma when DATABASE_URL is set; falls back to in-memory otherwise.

const DB_ENABLED = !!process.env.DATABASE_URL

async function getPrisma() {
  const { prisma } = await import('@/prisma/lib/prisma')
  return prisma
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

const _store = new Map<string, Subscription>()

function memUpsert(input: UpsertSubscriptionInput, existing?: Subscription): Subscription {
  const now = new Date().toISOString()
  const sub: Subscription = {
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
    cancelledAt: existing?.cancelledAt,
    stripeSubscriptionId: input.stripeSubscriptionId,
    stripeCustomerId: input.stripeCustomerId,
    stripePriceId: input.stripePriceId,
    couponCode: input.couponCode,
    discountPercent: input.discountPercent,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  _store.set(input.stripeSubscriptionId, sub)
  return sub
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function upsertSubscription(input: UpsertSubscriptionInput): Promise<Subscription> {
  if (DB_ENABLED) {
    try {
      const prisma = await getPrisma()
      const row = await prisma.subscription.upsert({
        where: { stripeSubscriptionId: input.stripeSubscriptionId },
        create: {
          stripeSubscriptionId: input.stripeSubscriptionId,
          stripeCustomerId: input.stripeCustomerId,
          stripePriceId: input.stripePriceId,
          tenantId: input.tenantId,
          tenantType: input.tenantType,
          plan: input.plan,
          billingCycle: input.billingCycle as 'monthly' | 'annual',
          status: input.status,
          currentPeriodStart: new Date(input.currentPeriodStart),
          currentPeriodEnd: new Date(input.currentPeriodEnd),
          trialStart: input.trialStart ? new Date(input.trialStart) : undefined,
          trialEnd: input.trialEnd ? new Date(input.trialEnd) : undefined,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
          couponCode: input.couponCode,
          discountPercent: input.discountPercent,
        },
        update: {
          stripeCustomerId: input.stripeCustomerId,
          stripePriceId: input.stripePriceId,
          plan: input.plan,
          billingCycle: input.billingCycle as 'monthly' | 'annual',
          status: input.status,
          currentPeriodStart: new Date(input.currentPeriodStart),
          currentPeriodEnd: new Date(input.currentPeriodEnd),
          trialStart: input.trialStart ? new Date(input.trialStart) : undefined,
          trialEnd: input.trialEnd ? new Date(input.trialEnd) : undefined,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
          couponCode: input.couponCode,
          discountPercent: input.discountPercent,
        },
      })
      return rowToSubscription(row)
    } catch (err) {
      console.error('[subscription-store] DB upsert failed, using in-memory fallback', err)
    }
  }
  return memUpsert(input, _store.get(input.stripeSubscriptionId))
}

export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  if (DB_ENABLED) {
    try {
      const prisma = await getPrisma()
      const row = await prisma.subscription.findUnique({ where: { stripeSubscriptionId } })
      return row ? rowToSubscription(row) : null
    } catch (err) {
      console.error('[subscription-store] DB findUnique failed', err)
    }
  }
  return _store.get(stripeSubscriptionId) ?? null
}

export async function getSubscriptionByTenantId(
  tenantId: string
): Promise<Subscription | null> {
  if (DB_ENABLED) {
    try {
      const prisma = await getPrisma()
      const row = await prisma.subscription.findFirst({
        where: { tenantId, status: { notIn: ['cancelled'] } },
        orderBy: { createdAt: 'desc' },
      })
      return row ? rowToSubscription(row) : null
    } catch (err) {
      console.error('[subscription-store] DB findFirst failed', err)
    }
  }
  for (const sub of _store.values()) {
    if (sub.tenantId === tenantId) return sub
  }
  return null
}

export async function cancelTenantSubscription(
  stripeSubscriptionId: string,
  cancelledAt: string
): Promise<Subscription | null> {
  if (DB_ENABLED) {
    try {
      const prisma = await getPrisma()
      const row = await prisma.subscription.update({
        where: { stripeSubscriptionId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(cancelledAt),
          plan: 'starter',
        },
      })
      return rowToSubscription(row)
    } catch (err) {
      console.error('[subscription-store] DB cancel failed', err)
    }
  }
  const sub = _store.get(stripeSubscriptionId)
  if (!sub) return null
  const cancelled: Subscription = {
    ...sub,
    status: 'cancelled',
    cancelledAt,
    plan: 'starter',
    updatedAt: new Date().toISOString(),
  }
  _store.set(stripeSubscriptionId, cancelled)
  return cancelled
}

export async function listSubscriptions(
  limit = 20,
  offset = 0
): Promise<{ data: Subscription[]; total: number }> {
  if (DB_ENABLED) {
    try {
      const prisma = await getPrisma()
      const [rows, total] = await Promise.all([
        prisma.subscription.findMany({
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.subscription.count(),
      ])
      return { data: rows.map(rowToSubscription), total }
    } catch (err) {
      console.error('[subscription-store] DB list failed', err)
    }
  }
  const all = Array.from(_store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return { data: all.slice(offset, offset + limit), total: all.length }
}

// ─── Row → domain type ────────────────────────────────────────────────────────

function rowToSubscription(row: {
  id: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  stripePriceId?: string | null
  tenantId: string
  tenantType: string
  plan: string
  billingCycle: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialStart?: Date | null
  trialEnd?: Date | null
  cancelAtPeriodEnd: boolean
  cancelledAt?: Date | null
  couponCode?: string | null
  discountPercent?: number | null
  createdAt: Date
  updatedAt: Date
}): Subscription {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tenantType: row.tenantType as TenantType,
    plan: row.plan as PlanTier,
    billingCycle: row.billingCycle as BillingCycle,
    status: row.status as SubscriptionStatus,
    currentPeriodStart: row.currentPeriodStart.toISOString(),
    currentPeriodEnd: row.currentPeriodEnd.toISOString(),
    trialStart: row.trialStart?.toISOString(),
    trialEnd: row.trialEnd?.toISOString(),
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    cancelledAt: row.cancelledAt?.toISOString(),
    stripeSubscriptionId: row.stripeSubscriptionId,
    stripeCustomerId: row.stripeCustomerId,
    stripePriceId: row.stripePriceId ?? undefined,
    couponCode: row.couponCode ?? undefined,
    discountPercent: row.discountPercent ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
