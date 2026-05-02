import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createSectionSchema } from '@/src/modules/academy/validators'
import { getCourse, createSection, getInstructorByUserId } from '@/src/modules/academy/course-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string }

// POST /api/v1/courses/:courseId/sections
export const POST = withTenant<Params>(async (req, { params, session }) => {
  if (!['super_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const course = await getCourse(params.courseId)
  if (!course) return NextResponse.json(fail('NOT_FOUND', 'Curso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  if (session.role === 'instructor') {
    const instructor = await getInstructorByUserId(session.userId)
    if (!instructor || !course.instructorIds.includes(instructor.id)) {
      return NextResponse.json(fail('FORBIDDEN', 'No puedes editar este curso.'), { status: HTTP_STATUS.FORBIDDEN })
    }
  }

  const body = await req.json().catch(() => null)
  const parsed = createSectionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const section = await createSection(params.courseId, parsed.data)
  return NextResponse.json(ok(section), { status: 201 })
})
