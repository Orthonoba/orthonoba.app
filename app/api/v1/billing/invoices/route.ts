import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createInvoiceSchema } from '@/src/modules/billing/validators'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Invoice } from '@/src/types/billing'

export const GET = withTenant(async (_req, { session, tenant: _tenant }) => {
  const canView = ['super_admin', 'clinic_admin', 'doctor'].includes(session.role)
  if (!canView) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  // TODO: IInvoiceRepository.findAll(tenant.clinicId)
  return NextResponse.json(paginated<Invoice>([], 0, 1, 20))
})

export const POST = withTenant(async (req, { session, tenant: _tenant }) => {
  if (!['super_admin', 'clinic_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = createInvoiceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IBillingService.createInvoice(tenant.clinicId, parsed.data)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
