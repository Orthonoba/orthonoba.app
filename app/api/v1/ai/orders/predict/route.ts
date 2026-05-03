import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { predictOrders } from '@/src/services/ai/order-predictor'
import { isAIEnabled } from '@/src/services/ai/provider'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

const schema = z.object({
  patientId:           z.string().uuid(),
  age:                 z.number().int().min(0).max(120).optional(),
  lastVisitDate:       z.string().datetime({ offset: true }).optional(),
  previousTreatments:  z.array(z.string()).default([]),
  appointmentHistory:  z.array(z.object({
    type: z.string(), date: z.string(), attended: z.boolean(),
  })).default([]),
  currentBalance:      z.number().nonnegative().optional(),
  notes:               z.string().max(1000).optional(),
})

// POST /api/v1/ai/orders/predict
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const prediction = await predictOrders({ ...parsed.data, clinicId: tenant.clinicId })
  return NextResponse.json(ok({ prediction, aiEnabled: isAIEnabled() }))
})
