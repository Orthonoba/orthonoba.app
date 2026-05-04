import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createDoctorProfileSchema } from '@/src/modules/doctors/validators'
import { mockDoctors } from '@/src/lib/mock-doctors'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { DoctorProfile } from '@/src/types/doctor'

// GET /api/v1/doctors — list doctors in this clinic
export const GET = withTenant(async (req, { tenant }) => {
  const { searchParams } = new URL(req.url)
  const specialty = searchParams.get('specialty')
  const acceptingNew = searchParams.get('accepting')
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')

  let doctors = mockDoctors.filter((d) => d.clinicId === tenant.clinicId)

  if (specialty) {
    doctors = doctors.filter((d) => d.specialties.includes(specialty as DoctorProfile['specialties'][0]))
  }
  if (acceptingNew === 'true') {
    doctors = doctors.filter((d) => d.isAcceptingNewPatients)
  }

  const total = doctors.length
  const data = doctors.slice((page - 1) * limit, page * limit)

  return NextResponse.json(paginated<DoctorProfile>(data, total, page, limit))
})

// POST /api/v1/doctors — create doctor profile (clinic_admin only)
export const POST = withTenant(async (req, { session, tenant: _tenant }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo administradores pueden registrar doctores.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  const body = await req.json().catch(() => null)
  const parsed = createDoctorProfileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IDoctorService.createProfile({ ...parsed.data, clinicId: tenant.clinicId })
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected. Stub route.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
