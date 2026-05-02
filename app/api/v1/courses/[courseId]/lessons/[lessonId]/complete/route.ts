import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updateLessonProgressSchema } from '@/src/modules/academy/validators'
import { getLesson } from '@/src/modules/academy/course-store'
import { getEnrollment, markLessonComplete, updateLessonProgress } from '@/src/modules/academy/enrollment-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string; lessonId: string }

// POST /api/v1/courses/:courseId/lessons/:lessonId/complete — mark lesson done
export const POST = withTenant<Params>(async (req, { params, session }) => {
  const lesson = await getLesson(params.lessonId)
  if (!lesson || lesson.courseId !== params.courseId) {
    return NextResponse.json(fail('NOT_FOUND', 'Lección no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  const enrollment = await getEnrollment(params.courseId, session.userId)
  if (!enrollment) {
    return NextResponse.json(fail('FORBIDDEN', 'No estás inscrito en este curso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  // If quiz lesson, must pass quiz first
  if (lesson.type === 'quiz' && lesson.quiz) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Completa el quiz para marcar esta lección como terminada.'),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const progress = await markLessonComplete(enrollment.id, params.lessonId, params.courseId, session.userId)
  return NextResponse.json(ok(progress))
})

// PATCH /api/v1/courses/:courseId/lessons/:lessonId/complete — update video position
export const PATCH = withTenant<Params>(async (req, { params, session }) => {
  const enrollment = await getEnrollment(params.courseId, session.userId)
  if (!enrollment) {
    return NextResponse.json(fail('FORBIDDEN', 'No estás inscrito.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = updateLessonProgressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const progress = await updateLessonProgress(
    enrollment.id, params.lessonId, params.courseId, session.userId, parsed.data
  )
  return NextResponse.json(ok(progress))
})
