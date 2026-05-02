import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/src/middleware/with-auth'
import { getClinicById } from '@/src/lib/mock-clinics'
import { updateClinicSchema } from '@/src/modules/clinic/validators'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { clinicId: string }

// GET /api/v1/clinics/[clinicId]
export const GET = withAuth<Params>(async (_req, { params, session }) => {
  const isAdmin = session.role === 'super_admin'
  const isSelf = session.clinicId === params.clinicId

  if (!isAdmin && !isSelf) {
    return NextResponse.json(fail('FORBIDDEN', 'Access denied.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const clinic = getClinicById(params.clinicId)
  if (!clinic) {
    return NextResponse.json(fail('NOT_FOUND', 'Clínica no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  return NextResponse.json(ok(clinic))
})

// PATCH /api/v1/clinics/[clinicId]
export const PATCH = withAuth<Params>(async (req, { params, session }) => {
  const isAdmin = session.role === 'super_admin'
  const isSelf = session.clinicId === params.clinicId

  if (!isAdmin && !isSelf) {
    return NextResponse.json(fail('FORBIDDEN', 'Access denied.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = updateClinicSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IClinicRepository.update(params.clinicId, parsed.data)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected. This route is a stub.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
