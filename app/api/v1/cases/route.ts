import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createCaseSchema } from '@/src/modules/cases/validators'
import { mockCases } from '@/src/lib/mock-cases'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { DentalCase } from '@/src/types/case'

// GET /api/v1/cases
export const GET = withTenant(async (req, { session, tenant }) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const assignedDoctorId = searchParams.get('doctorId')
  const patientId = searchParams.get('patientId')
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')

  let cases = mockCases.filter((c) => c.clinicId === tenant.clinicId)

  // Doctor role: only see their assigned cases
  if (session.role === 'doctor') {
    cases = cases.filter((c) => c.assignedDoctorId === session.userId || (c.collaboratingDoctorIds ?? []).includes(session.userId))
  }

  if (status) cases = cases.filter((c) => c.status === status)
  if (assignedDoctorId) cases = cases.filter((c) => c.assignedDoctorId === assignedDoctorId)
  if (patientId) cases = cases.filter((c) => c.patientId === patientId)

  const total = cases.length
  const data = cases.slice((page - 1) * limit, page * limit)

  return NextResponse.json(paginated<DentalCase>(data, total, page, limit))
})

// POST /api/v1/cases
export const POST = withTenant(async (req, { session, tenant }) => {
  const canCreate = ['super_admin', 'clinic_admin', 'doctor'].includes(session.role)
  if (!canCreate) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso para crear casos.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  const body = await req.json().catch(() => null)
  const parsed = createCaseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: ICaseService.create(tenant.clinicId, parsed.data, session.userId)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected. Stub route.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
