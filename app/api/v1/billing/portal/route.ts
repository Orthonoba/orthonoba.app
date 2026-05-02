import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { portalSchema } from '@/src/modules/billing/validators'
import { createPortalSession, getCustomerByTenantId } from '@/src/services/stripe/billing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// POST /api/v1/billing/portal — create a Stripe Customer Portal session
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = portalSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const customerId = await getCustomerByTenantId(tenant.clinicId)
  if (!customerId) {
    return NextResponse.json(
      fail('NOT_FOUND', 'No se encontró cuenta de facturación.'),
      { status: HTTP_STATUS.NOT_FOUND }
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const returnUrl = parsed.data.returnUrl ?? `${baseUrl}/dashboard/billing`

  try {
    const portalSession = await createPortalSession(customerId, returnUrl)
    return NextResponse.json(ok(portalSession))
  } catch (err) {
    console.error('[billing:portal]', err)
    return NextResponse.json(
      fail('STRIPE_ERROR', 'No se pudo crear la sesión del portal.'),
      { status: HTTP_STATUS.STRIPE_ERROR }
    )
  }
})
