import { NextResponse } from 'next/server'
import { withAuth } from '@/src/middleware/with-auth'
import { getClinicById } from '@/src/lib/mock-clinics'
import { updateLabProfileSchema } from '@/src/modules/laboratories/validators'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { labId: string }

// GET /api/v1/labs/[labId]
export const GET = withAuth<Params>(async (_req, { params, session }) => {
  const lab = getClinicById(params.labId)

  if (!lab || lab.type !== 'lab') {
    return NextResponse.json(fail('NOT_FOUND', 'Laboratorio no encontrado.'), {
      status: HTTP_STATUS.NOT_FOUND,
    })
  }

  // Lab admin can only see their own lab
  const isSuperAdmin = session.role === 'super_admin'
  const isOwnLab = session.clinicId === params.labId

  if (!isSuperAdmin && !isOwnLab) {
    // Other roles see limited public info only
    const publicInfo = {
      id: lab.id,
      name: lab.name,
      email: lab.email,
      phone: lab.phone,
      status: lab.status,
    }
    return NextResponse.json(ok(publicInfo))
  }

  return NextResponse.json(ok(lab))
})

// PATCH /api/v1/labs/[labId] — lab_admin updates own lab profile
export const PATCH = withAuth<Params>(async (req, { params, session }) => {
  const isSuperAdmin = session.role === 'super_admin'
  const isOwnLab = session.role === 'lab_admin' && session.clinicId === params.labId

  if (!isSuperAdmin && !isOwnLab) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso para modificar este laboratorio.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  const body = await req.json().catch(() => null)
  const parsed = updateLabProfileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: ILaboratoryService.updateProfile(params.labId, parsed.data)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
