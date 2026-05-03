import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createInstructorSchema } from '@/src/modules/academy/validators'
import {
  createInstructor, listInstructors, getInstructorByUserId,
} from '@/src/modules/academy/course-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/instructors — public instructor directory
export async function GET() {
  const instructors = await listInstructors()
  return NextResponse.json(ok(instructors), {
    headers: { 'Cache-Control': 'public, s-maxage=300' },
  })
}

// POST /api/v1/instructors — register instructor profile (super_admin only)
export const POST = withTenant(async (req, { session }) => {
  if (session.role !== 'super_admin') {
    return NextResponse.json(fail('FORBIDDEN', 'Solo super_admin puede registrar instructores.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = createInstructorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  // Prevent duplicates
  const existing = await getInstructorByUserId(parsed.data.userId)
  if (existing) {
    return NextResponse.json(fail('CONFLICT', 'Ya existe un perfil de instructor para este usuario.'), { status: HTTP_STATUS.CONFLICT })
  }

  const instructor = await createInstructor({ ...parsed.data, isVerified: true })
  return NextResponse.json(ok(instructor), { status: 201 })
})
