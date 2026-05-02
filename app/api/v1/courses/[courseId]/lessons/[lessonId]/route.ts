import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getLesson } from '@/src/modules/academy/course-store'
import { getEnrollment } from '@/src/modules/academy/enrollment-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string; lessonId: string }

// GET /api/v1/courses/:courseId/lessons/:lessonId
// Returns full content only if enrolled or free-preview or instructor
export const GET = withTenant<Params>(async (_req, { params, session }) => {
  const lesson = await getLesson(params.lessonId)
  if (!lesson || lesson.courseId !== params.courseId) {
    return NextResponse.json(fail('NOT_FOUND', 'Lección no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  const isAdmin = ['super_admin', 'instructor'].includes(session.role)
  const enrollment = await getEnrollment(params.courseId, session.userId)
  const hasAccess = isAdmin || !!enrollment || lesson.isFreePreview

  if (!hasAccess) {
    return NextResponse.json(fail('FORBIDDEN', 'Debes inscribirte para acceder a esta lección.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  // Strip quiz answers for non-admin
  const safe = isAdmin ? lesson : {
    ...lesson,
    quiz: lesson.quiz
      ? {
          ...lesson.quiz,
          questions: lesson.quiz.questions.map((q) => ({
            ...q,
            answers: q.answers.map((a) => ({ id: a.id, text: a.text, explanation: undefined, isCorrect: undefined })),
          })),
        }
      : undefined,
  }

  return NextResponse.json(ok(safe))
})
