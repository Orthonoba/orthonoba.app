import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { checkoutSchema } from '@/src/modules/billing/validators'
import { createCheckoutSession, getOrCreateCustomer } from '@/src/services/stripe/billing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// POST /api/v1/stripe/checkout — create Stripe Checkout session
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo administradores pueden suscribirse.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  const body = await req.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const { plan, billingCycle, promotionCode, successUrl, cancelUrl } = parsed.data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    // TODO: get real tenant email from IClinicRepository / ILabRepository
    const tenantEmail = `${tenant.clinicId}@orthonoba.app`
    const customerId = await getOrCreateCustomer(
      tenant.clinicId,
      tenantEmail,
      tenant.clinicName,
      tenant.type
    )

    const checkoutSession = await createCheckoutSession({
      tenantId: tenant.clinicId,
      tenantType: tenant.type,
      customerId,
      plan,
      billingCycle,
      successUrl: successUrl ?? `${baseUrl}/dashboard/billing?checkout=success`,
      cancelUrl: cancelUrl ?? `${baseUrl}/dashboard/billing?checkout=cancelled`,
      promotionCode,
    })

    return NextResponse.json(ok({ url: checkoutSession.url, sessionId: checkoutSession.id }))
  } catch (err) {
    console.error('[stripe:checkout]', err)
    return NextResponse.json(
      fail('STRIPE_ERROR', 'No se pudo crear la sesión de pago.'),
      { status: HTTP_STATUS.STRIPE_ERROR }
    )
  }
})
