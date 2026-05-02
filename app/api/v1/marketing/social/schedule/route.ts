import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createSocialScheduleSchema } from '@/src/modules/marketing/validators'
import { createSocialSchedule, listSocialSchedules } from '@/src/modules/marketing/campaign-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

export const GET = withTenant(async (_req, { tenant }) => {
  const schedules = await listSocialSchedules(tenant.clinicId)
  return NextResponse.json(ok(schedules))
})

export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createSocialScheduleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const schedule = await createSocialSchedule({ ...parsed.data, clinicId: tenant.clinicId })
  return NextResponse.json(ok(schedule), { status: 201 })
})
