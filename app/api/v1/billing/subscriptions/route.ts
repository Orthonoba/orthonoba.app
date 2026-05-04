import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { getSubscription as getStripeSubscription } from '@/src/services/stripe/billing'
import { getPlan, TOKEN_ALLOCATIONS } from '@/src/config/plans'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'


// GET /api/v1/billing/subscriptions — current subscription with plan details
export const GET = withTenant(async (_req, { tenant, session }) => {
  const canView = ['super_admin', 'clinic_admin', 'lab_admin', 'doctor'].includes(session.role)
  if (!canView) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const subscription = await getSubscriptionByTenantId(tenant.clinicId)

  if (!subscription) {
    return NextResponse.json(
      ok({
        subscription: null,
        plan: getPlan('starter'),
        tokenAllocation: TOKEN_ALLOCATIONS.starter,
        message: 'Sin suscripción activa — plan Starter por defecto.',
      })
    )
  }

  let stripeDetails = null
  if (subscription.stripeSubscriptionId) {
    try {
      const stripeSub = await getStripeSubscription(subscription.stripeSubscriptionId)
      stripeDetails = {
        status: stripeSub.status,
        defaultPaymentMethod: typeof stripeSub.default_payment_method === 'object'
          ? stripeSub.default_payment_method?.id ?? null
          : stripeSub.default_payment_method,
      }
    } catch {
      // Stripe unavailable — proceed without live details
    }
  }

  const plan = getPlan(subscription.plan)
  const tokenAllocation = TOKEN_ALLOCATIONS[subscription.plan]

  return NextResponse.json(
    ok({
      subscription,
      plan,
      tokenAllocation,
      stripeDetails,
    })
  )
})
