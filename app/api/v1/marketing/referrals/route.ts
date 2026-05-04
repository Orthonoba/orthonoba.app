import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createReferralProgramSchema } from '@/src/modules/marketing/validators'
import { createReferralProgram, listReferralPrograms } from '@/src/modules/marketing/campaign-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'


export const GET = withTenant(async (_req, { tenant }) => {
  const programs = await listReferralPrograms(tenant.clinicId)
  return NextResponse.json(ok(programs))
})

export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createReferralProgramSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const program = await createReferralProgram({ ...parsed.data, clinicId: tenant.clinicId })
  return NextResponse.json(ok(program), { status: 201 })
})
