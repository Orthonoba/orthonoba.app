import { NextResponse } from 'next/server'
import { withAuth } from '@/src/middleware/with-auth'
import { mockClinics } from '@/src/lib/mock-clinics'
import { createClinicSchema } from '@/src/modules/clinic/validators'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Clinic } from '@/src/types/clinic'

// GET /api/v1/clinics — list (admin only)
export const GET = withAuth(async (_req, { session }) => {
  if (session.role !== 'super_admin') {
    return NextResponse.json(fail('FORBIDDEN', 'Admin access required.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  return NextResponse.json(paginated<Clinic>(mockClinics, mockClinics.length, 1, 50))
})

// POST /api/v1/clinics — create (admin only)
export const POST = withAuth(async (req, { session }) => {
  if (session.role !== 'super_admin') {
    return NextResponse.json(fail('FORBIDDEN', 'Admin access required.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  const body = await req.json().catch(() => null)
  const parsed = createClinicSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IClinicRepository.create(parsed.data) when DB is connected
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected. This route is a stub.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
