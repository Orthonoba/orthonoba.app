import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updateOrderStatusSchema } from '@/src/modules/orders/validators'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { orderId: string }

export const GET = withTenant<Params>(async (_req, { params, tenant }) => {
  // TODO: IOrderRepository.findById(tenant.clinicId, params.orderId)
  return NextResponse.json(fail('NOT_FOUND', 'Orden no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
})

export const PATCH = withTenant<Params>(async (req, { params, session }) => {
  const body = await req.json().catch(() => null)
  const parsed = updateOrderStatusSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Estado inválido.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IOrderService.updateStatus(clinicId, params.orderId, parsed.data.status)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
