import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { submitQuizSchema } from '@/src/modules/academy/validators'
import { getEnrollment, submitQuizAttempt } from '@/src/modules/academy/enrollment-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string; lessonId: string }

// POST /api/v1/courses/:courseId/lessons/:lessonId/quiz/submit
export const POST = withTenant<Params>(async (req, { params, session }) => {
  const enrollment = await getEnrollment(params.courseId, session.userId)
  if (!enrollment) {
    return NextResponse.json(fail('FORBIDDEN', 'No estás inscrito en este curso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = submitQuizSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  try {
    const { attempt, passed, canRetry } = await submitQuizAttempt(
      enrollment.id,
      params.lessonId,
      session.userId,
      parsed.data.answers,
      parsed.data.timeTakenSeconds
    )

    return NextResponse.json(ok({ attempt, passed, canRetry }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al procesar el quiz.'
    return NextResponse.json(fail('VALIDATION_ERROR', msg), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
})
