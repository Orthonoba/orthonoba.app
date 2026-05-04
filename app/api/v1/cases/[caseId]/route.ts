import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updateCaseSchema } from '@/src/modules/cases/validators'
import { getCaseById } from '@/src/lib/mock-cases'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { caseId: string }

// GET /api/v1/cases/[caseId]
export const GET = withTenant<Params>(async (_req, { params: _params, session, tenant: _tenant }) => {
  const dentalCase = getCaseById(params.caseId)

  if (!dentalCase || dentalCase.clinicId !== tenant.clinicId) {
    return NextResponse.json(fail('NOT_FOUND', 'Caso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  // Doctor can only see their cases
  if (session.role === 'doctor') {
    const isAssigned = dentalCase.assignedDoctorId === session.userId ||
      (dentalCase.collaboratingDoctorIds ?? []).includes(session.userId)
    if (!isAssigned) {
      return NextResponse.json(fail('FORBIDDEN', 'No tienes acceso a este caso.'), { status: HTTP_STATUS.FORBIDDEN })
    }
  }

  return NextResponse.json(ok(dentalCase))
})

// PATCH /api/v1/cases/[caseId] — update case details
export const PATCH = withTenant<Params>(async (req, { params, session, tenant }) => {
  const canEdit = ['super_admin', 'clinic_admin', 'doctor'].includes(session.role)
  if (!canEdit) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = updateCaseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: ICaseService.update(tenant.clinicId, params.caseId, parsed.data, session.userId)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})

// DELETE /api/v1/cases/[caseId] — admin-only cancel/archive
export const DELETE = withTenant<Params>(async (_req, { params: _params, session, tenant: _tenant }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo administradores.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  // TODO: ICaseService.cancel(tenant.clinicId, params.caseId, 'Admin cancellation', session.userId)
  return NextResponse.json(ok({ cancelled: true }))
})
