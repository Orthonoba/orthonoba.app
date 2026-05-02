import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createReviewRequestSchema } from '@/src/modules/marketing/validators'
import { createReviewRequest, listReviewRequests } from '@/src/modules/marketing/campaign-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

export const GET = withTenant(async (_req, { tenant }) => {
  const reviews = await listReviewRequests(tenant.clinicId)
  return NextResponse.json(ok(reviews))
})

export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createReviewRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const review = await createReviewRequest({ ...parsed.data, clinicId: tenant.clinicId, status: 'pending' })
  return NextResponse.json(ok(review), { status: 201 })
})
