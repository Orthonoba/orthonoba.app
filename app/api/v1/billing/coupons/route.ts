import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { validateCouponSchema, applyCouponSchema } from '@/src/modules/billing/validators'
import { validatePromotionCode, applyPromotionCodeToSubscription } from '@/src/services/stripe/coupons'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/billing/coupons?code=XX&plan=growth — validate a coupon code
export const GET = withTenant(async (req, { tenant }) => {
  const { searchParams } = new URL(req.url)
  const parsed = validateCouponSchema.safeParse({
    code: searchParams.get('code'),
    plan: searchParams.get('plan') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Código de cupón inválido.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  try {
    const result = await validatePromotionCode(parsed.data.code, parsed.data.plan)

    if (!result.valid) {
      const code = result.errorCode === 'COUPON_EXPIRED' ? 'COUPON_EXPIRED' : 'COUPON_INVALID'
      return NextResponse.json(
        fail(code, result.message ?? 'Cupón no válido.'),
        { status: HTTP_STATUS[code] }
      )
    }

    return NextResponse.json(ok(result.coupon))
  } catch (err) {
    console.error('[billing:coupons:validate]', err)
    return NextResponse.json(
      fail('STRIPE_ERROR', 'No se pudo validar el cupón.'),
      { status: HTTP_STATUS.STRIPE_ERROR }
    )
  }
})

// POST /api/v1/billing/coupons — apply a coupon to active subscription
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = applyCouponSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const subscription = await getSubscriptionByTenantId(tenant.clinicId)
  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json(
      fail('SUBSCRIPTION_REQUIRED', 'No hay suscripción activa para aplicar el cupón.'),
      { status: HTTP_STATUS.SUBSCRIPTION_REQUIRED }
    )
  }

  try {
    // Validate first
    const validation = await validatePromotionCode(parsed.data.code)
    if (!validation.valid) {
      const code = validation.errorCode === 'COUPON_EXPIRED' ? 'COUPON_EXPIRED' : 'COUPON_INVALID'
      return NextResponse.json(
        fail(code, validation.message ?? 'Cupón no válido.'),
        { status: HTTP_STATUS[code] }
      )
    }

    // Look up the promotion code ID from Stripe to apply it
    const { stripe } = await import('@/src/services/stripe/index')
    const promoCodes = await stripe.promotionCodes.list({ code: parsed.data.code, active: true, limit: 1 })
    const promoCodeId = promoCodes.data[0]?.id

    if (!promoCodeId) {
      return NextResponse.json(
        fail('COUPON_INVALID', 'Código de promoción no encontrado.'),
        { status: HTTP_STATUS.COUPON_INVALID }
      )
    }

    await applyPromotionCodeToSubscription(subscription.stripeSubscriptionId, promoCodeId)

    return NextResponse.json(ok({ applied: true, coupon: validation.coupon }))
  } catch (err) {
    console.error('[billing:coupons:apply]', err)
    return NextResponse.json(
      fail('STRIPE_ERROR', 'No se pudo aplicar el cupón.'),
      { status: HTTP_STATUS.STRIPE_ERROR }
    )
  }
})
