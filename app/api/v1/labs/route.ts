import { NextResponse } from 'next/server'
import { withAuth } from '@/src/middleware/with-auth'
import { mockClinics } from '@/src/lib/mock-clinics'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Clinic } from '@/src/types/clinic'

// GET /api/v1/labs — list all labs
// super_admin: all labs | clinic_admin/doctor: publicly visible labs (for order placement)
export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')
  const _capability = searchParams.get('capability')

  let labs = mockClinics.filter((c) => c.type === 'lab' && c.isActive)

  // Non-super-admin users only see active labs they could work with
  if (session.role !== 'super_admin') {
    labs = labs.filter((l) => l.status === 'active')
  }

  if (country) {
    // TODO: filter by delivery country when DB is connected
  }

  return NextResponse.json(paginated<Clinic>(labs, labs.length, 1, 50))
})

// POST /api/v1/labs — create a new lab tenant (super_admin only)
export const POST = withAuth(async (req, { session }) => {
  if (session.role !== 'super_admin') {
    return NextResponse.json(fail('FORBIDDEN', 'Solo super administradores pueden crear laboratorios.'), {
      status: HTTP_STATUS.FORBIDDEN,
    })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Request body required.'), {
      status: HTTP_STATUS.VALIDATION_ERROR,
    })
  }

  // TODO: ILaboratoryService.createLab(body)
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected. Stub route.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
