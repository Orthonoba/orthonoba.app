import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createCheckoutSession, getOrCreateCustomer } from '@/src/services/stripe/billing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['pro', 'enterprise']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    // TODO: get clinic email from IClinicRepository
    const customerId = await getOrCreateCustomer(tenant.clinicId, `${tenant.clinicId}@orthonoba.app`, tenant.clinicName)

    const session = await createCheckoutSession({
      clinicId: tenant.clinicId,
      customerId,
      plan: parsed.data.plan,
      successUrl: parsed.data.successUrl ?? `${baseUrl}/dashboard?checkout=success`,
      cancelUrl: parsed.data.cancelUrl ?? `${baseUrl}/dashboard?checkout=cancelled`,
    })

    return NextResponse.json(ok({ url: session.url }))
  } catch (err) {
    console.error('[stripe:checkout]', err)
    return NextResponse.json(fail('STRIPE_ERROR', 'No se pudo crear la sesión de pago.'), {
      status: HTTP_STATUS.STRIPE_ERROR,
    })
  }
})
