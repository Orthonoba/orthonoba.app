import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createPatientSchema } from '@/src/modules/patient/validators'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Patient } from '@/src/types/patient'

// GET /api/v1/patients
export const GET = withTenant(async (_req, { tenant: _tenant }) => {
  // TODO: IPatientRepository.findAll(tenant.clinicId, filters)
  return NextResponse.json(paginated<Patient>([], 0, 1, 20))
})

// POST /api/v1/patients
export const POST = withTenant(async (req, { session, tenant: _tenant }) => {
  const canWrite = ['super_admin', 'clinic_admin', 'doctor'].includes(session.role)
  if (!canWrite) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso para crear pacientes.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  const body = await req.json().catch(() => null)
  const parsed = createPatientSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IPatientRepository.create({ clinicId: tenant.clinicId, ...parsed.data })
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected. This route is a stub.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
