import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updatePatientSchema } from '@/src/modules/patient/validators'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { patientId: string }

export const GET = withTenant<Params>(async (_req, { params: _params, tenant: _tenant }) => {
  // TODO: IPatientRepository.findById(tenant.clinicId, params.patientId)
  return NextResponse.json(fail('NOT_FOUND', 'Paciente no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
})

export const PATCH = withTenant<Params>(async (req, { params: _params, session, tenant: _tenant }) => {
  const canWrite = ['super_admin', 'clinic_admin', 'doctor'].includes(session.role)
  if (!canWrite) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = updatePatientSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IPatientRepository.update(tenant.clinicId, params.patientId, parsed.data)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})

export const DELETE = withTenant<Params>(async (_req, { params: _params, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo administradores.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  // TODO: IPatientRepository.delete(params.patientId) — soft delete (archive)
  return NextResponse.json(ok({ archived: true }))
})
