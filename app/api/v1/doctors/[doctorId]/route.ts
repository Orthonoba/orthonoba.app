import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updateDoctorProfileSchema } from '@/src/modules/doctors/validators'
import { getDoctorProfileById } from '@/src/lib/mock-doctors'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { doctorId: string }

// GET /api/v1/doctors/[doctorId]
export const GET = withTenant<Params>(async (_req, { params, tenant }) => {
  const doctor = getDoctorProfileById(params.doctorId)

  if (!doctor || doctor.clinicId !== tenant.clinicId) {
    return NextResponse.json(fail('NOT_FOUND', 'Doctor no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  return NextResponse.json(ok(doctor))
})

// PATCH /api/v1/doctors/[doctorId]
export const PATCH = withTenant<Params>(async (req, { params, session, tenant }) => {
  const doctor = getDoctorProfileById(params.doctorId)

  if (!doctor || doctor.clinicId !== tenant.clinicId) {
    return NextResponse.json(fail('NOT_FOUND', 'Doctor no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  // Doctor can update their own profile; admins can update any
  const isSelf = session.role === 'doctor' && doctor.userId === session.userId
  const isAdmin = ['super_admin', 'clinic_admin'].includes(session.role)

  if (!isSelf && !isAdmin) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = updateDoctorProfileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: IDoctorService.updateProfile(tenant.clinicId, params.doctorId, parsed.data)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})

// DELETE /api/v1/doctors/[doctorId] — deactivate (clinic_admin only)
export const DELETE = withTenant<Params>(async (_req, { params, session, tenant }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo administradores.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  // TODO: IDoctorService.deactivate(tenant.clinicId, params.doctorId)
  return NextResponse.json(ok({ deactivated: true }))
})
