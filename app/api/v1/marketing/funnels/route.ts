import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createFunnelSchema } from '@/src/modules/marketing/validators'
import { createFunnel, listFunnels } from '@/src/modules/marketing/campaign-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

export const GET = withTenant(async (_req, { tenant }) => {
  const data = await listFunnels(tenant.clinicId)
  return NextResponse.json(ok(data))
})

export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createFunnelSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const steps = parsed.data.steps.map((s) => ({
    ...s,
    id: crypto.randomUUID(),
    funnelId: '',
    enteredCount: 0,
    completedCount: 0,
    exitCount: 0,
  }))
  const funnel = await createFunnel({ ...parsed.data, steps, clinicId: tenant.clinicId })
  return NextResponse.json(ok(funnel), { status: 201 })
})
