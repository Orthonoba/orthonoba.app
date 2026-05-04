import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createOrderSchema } from '@/src/modules/orders/validators'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { DentalOrder } from '@/src/types/orders'

export const GET = withTenant(async (_req, { tenant: _tenant }) => {
  // TODO: IOrderRepository.findAll(tenant.clinicId, queryParams)
  return NextResponse.json(paginated<DentalOrder>([], 0, 1, 20))
})

export const POST = withTenant(async (req, { session, tenant: _tenant }) => {
  const canCreate = ['admin', 'dentist'].includes(session.role)
  if (!canCreate) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = createOrderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IOrderRepository.create({ clinicId: tenant.clinicId, ...parsed.data })
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
