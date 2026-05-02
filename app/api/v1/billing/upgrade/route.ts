import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { upgradeSchema } from '@/src/modules/billing/validators'
import { changePlan, previewPlanChange } from '@/src/services/stripe/billing'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { isUpgrade, isDowngrade, PLANS } from '@/src/config/plans'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// POST /api/v1/billing/upgrade — upgrade or downgrade subscription plan
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = upgradeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const { plan: newPlan, billingCycle, preview } = parsed.data

  const subscription = await getSubscriptionByTenantId(tenant.clinicId)
  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json(
      fail('SUBSCRIPTION_REQUIRED', 'No hay suscripción activa.'),
      { status: HTTP_STATUS.SUBSCRIPTION_REQUIRED }
    )
  }

  if (subscription.plan === newPlan && subscription.billingCycle === billingCycle) {
    return NextResponse.json(
      fail('CONFLICT', 'Ya estás en este plan con el mismo ciclo de facturación.'),
      { status: HTTP_STATUS.CONFLICT }
    )
  }

  if (newPlan === 'enterprise' && PLANS.enterprise.pricing.custom) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'El plan Enterprise requiere contactar con ventas.'),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  try {
    if (preview) {
      const proration = await previewPlanChange(subscription.stripeSubscriptionId, newPlan, billingCycle)
      return NextResponse.json(
        ok({
          preview: true,
          amountDue: proration.amount_due,
          currency: proration.currency,
          lines: proration.lines.data.map((l) => ({
            description: l.description,
            amount: l.amount,
          })),
        })
      )
    }

    const direction = isUpgrade(subscription.plan, newPlan) ? 'upgrade'
      : isDowngrade(subscription.plan, newPlan) ? 'downgrade'
      : 'cycle-change'

    const updated = await changePlan({
      subscriptionId: subscription.stripeSubscriptionId,
      newPlan,
      newBillingCycle: billingCycle,
      prorationBehavior: direction === 'upgrade' ? 'always_invoice' : 'none',
    })

    // Period end is on SubscriptionItem in Stripe SDK v22+
    const periodEnd = updated.items.data[0]?.current_period_end

    return NextResponse.json(
      ok({
        direction,
        plan: newPlan,
        billingCycle,
        status: updated.status,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      })
    )
  } catch (err) {
    console.error('[billing:upgrade]', err)
    return NextResponse.json(
      fail('STRIPE_ERROR', 'No se pudo cambiar el plan.'),
      { status: HTTP_STATUS.STRIPE_ERROR }
    )
  }
})
