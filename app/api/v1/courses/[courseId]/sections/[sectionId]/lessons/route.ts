import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createLessonSchema } from '@/src/modules/academy/validators'
import {
  getCourse, getSection, createLesson, getInstructorByUserId,
} from '@/src/modules/academy/course-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string; sectionId: string }

// POST /api/v1/courses/:courseId/sections/:sectionId/lessons
export const POST = withTenant<Params>(async (req, { params, session }) => {
  if (!['super_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const [course, section] = await Promise.all([
    getCourse(params.courseId),
    getSection(params.sectionId),
  ])

  if (!course || !section || section.courseId !== params.courseId) {
    return NextResponse.json(fail('NOT_FOUND', 'Curso o sección no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  if (session.role === 'instructor') {
    const instructor = await getInstructorByUserId(session.userId)
    if (!instructor || !course.instructorIds.includes(instructor.id)) {
      return NextResponse.json(fail('FORBIDDEN', 'No puedes editar este curso.'), { status: HTTP_STATUS.FORBIDDEN })
    }
  }

  const body = await req.json().catch(() => null)
  const parsed = createLessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const lessonData = {
    ...parsed.data,
    resources: parsed.data.resources?.map((r) => ({ ...r, id: crypto.randomUUID() })),
  }
  const lesson = await createLesson(params.courseId, params.sectionId, lessonData)
  return NextResponse.json(ok(lesson), { status: 201 })
})
