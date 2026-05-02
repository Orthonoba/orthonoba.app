import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { enrollSchema } from '@/src/modules/academy/validators'
import { enrollUser } from '@/src/modules/academy/enrollment-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string }

// POST /api/v1/courses/:courseId/enroll
export const POST = withTenant<Params>(async (req, { params, tenant, session }) => {
  const body = await req.json().catch(() => ({}))
  const parsed = enrollSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const result = await enrollUser(
    params.courseId,
    session.userId,
    tenant.clinicId ?? null,
    tenant.plan,
    parsed.data.paymentIntentId
  )

  if (!result.success) {
    return NextResponse.json(
      fail('PLAN_LIMIT_EXCEEDED', result.error ?? 'No puedes acceder a este curso con tu plan actual.'),
      { status: HTTP_STATUS.PLAN_LIMIT_EXCEEDED }
    )
  }

  return NextResponse.json(ok(result.enrollment), { status: 201 })
})
