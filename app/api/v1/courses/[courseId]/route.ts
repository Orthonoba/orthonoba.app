import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updateCourseSchema } from '@/src/modules/academy/validators'
import {
  getCourse, getCourseBySlug, updateCourse, deleteCourse,
  getCourseWithFullContent, getInstructorByUserId,
} from '@/src/modules/academy/course-store'
import { getEnrollment } from '@/src/modules/academy/enrollment-store'
import { sanitizeCourseForPublic } from '../route'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string }

// GET /api/v1/courses/:courseId — course detail (slug or id accepted)
export const GET = withTenant<Params>(async (_req, { params, session }) => {
  const isSlug = !params.courseId.match(/^[0-9a-f-]{36}$/)
  const course = isSlug
    ? await getCourseBySlug(params.courseId)
    : await getCourse(params.courseId)

  if (!course) {
    return NextResponse.json(fail('NOT_FOUND', 'Curso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  const isAdmin = ['super_admin', 'instructor'].includes(session.role)

  // Check enrollment for full content access
  const enrollment = await getEnrollment(course.id, session.userId)
  const hasAccess = isAdmin || !!enrollment

  const fullCourse = getCourseWithFullContent(course.id) ?? course

  return NextResponse.json(ok(hasAccess ? fullCourse : sanitizeCourseForPublic(fullCourse)))
})

// PATCH /api/v1/courses/:courseId
export const PATCH = withTenant<Params>(async (req, { params, session }) => {
  if (!['super_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const course = await getCourse(params.courseId)
  if (!course) return NextResponse.json(fail('NOT_FOUND', 'Curso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  // Instructor can only edit their own courses
  if (session.role === 'instructor') {
    const instructor = await getInstructorByUserId(session.userId)
    if (!instructor || !course.instructorIds.includes(instructor.id)) {
      return NextResponse.json(fail('FORBIDDEN', 'No puedes editar este curso.'), { status: HTTP_STATUS.FORBIDDEN })
    }
  }

  const body = await req.json().catch(() => null)
  const parsed = updateCourseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const updated = await updateCourse(params.courseId, parsed.data)
  return NextResponse.json(ok(updated))
})

// DELETE /api/v1/courses/:courseId
export const DELETE = withTenant<Params>(async (_req, { params, session }) => {
  if (session.role !== 'super_admin') {
    return NextResponse.json(fail('FORBIDDEN', 'Solo super_admin puede eliminar cursos.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const deleted = await deleteCourse(params.courseId)
  if (!deleted) return NextResponse.json(fail('NOT_FOUND', 'Curso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
  return NextResponse.json(ok({ deleted: true }))
})
