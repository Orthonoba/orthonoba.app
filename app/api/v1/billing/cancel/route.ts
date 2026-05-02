import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { cancelSchema } from '@/src/modules/billing/validators'
import { cancelSubscription, resumeSubscription } from '@/src/services/stripe/billing'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type Stripe from 'stripe'

// POST /api/v1/billing/cancel — cancel or resume subscription
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = cancelSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const subscription = await getSubscriptionByTenantId(tenant.clinicId)
  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json(
      fail('SUBSCRIPTION_REQUIRED', 'No hay suscripción activa.'),
      { status: HTTP_STATUS.SUBSCRIPTION_REQUIRED }
    )
  }

  if (subscription.status === 'cancelled') {
    return NextResponse.json(
      fail('CONFLICT', 'La suscripción ya está cancelada.'),
      { status: HTTP_STATUS.CONFLICT }
    )
  }

  const { atPeriodEnd } = parsed.data

  try {
    // If already scheduled to cancel, this call resumes it
    if (subscription.cancelAtPeriodEnd && atPeriodEnd) {
      const resumed = await resumeSubscription(subscription.stripeSubscriptionId)
      // Period end is on SubscriptionItem in Stripe SDK v22+
      const periodEnd = resumed.items.data[0]?.current_period_end
      return NextResponse.json(
        ok({
          action: 'resumed',
          cancelAtPeriodEnd: resumed.cancel_at_period_end,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        })
      )
    }

    const result = await cancelSubscription(subscription.stripeSubscriptionId, !atPeriodEnd)

    // Distinguish between Subscription (cancel at period end) and DeletedSubscription (immediate)
    const isCancelled = (result as Stripe.Subscription).status === 'canceled'
      || !('cancel_at_period_end' in result)

    const periodEnd = 'items' in result
      ? (result as Stripe.Subscription).items.data[0]?.current_period_end
      : undefined

    return NextResponse.json(
      ok({
        action: atPeriodEnd ? 'scheduled_cancellation' : 'cancelled',
        cancelAtPeriodEnd: 'cancel_at_period_end' in result ? result.cancel_at_period_end : false,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      })
    )
  } catch (err) {
    console.error('[billing:cancel]', err)
    return NextResponse.json(
      fail('STRIPE_ERROR', 'No se pudo cancelar la suscripción.'),
      { status: HTTP_STATUS.STRIPE_ERROR }
    )
  }
})
