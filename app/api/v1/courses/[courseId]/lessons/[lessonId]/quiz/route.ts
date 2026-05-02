import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createQuizSchema, submitQuizSchema } from '@/src/modules/academy/validators'
import { getLesson, saveQuiz, getQuizByLesson } from '@/src/modules/academy/course-store'
import { getEnrollment, submitQuizAttempt } from '@/src/modules/academy/enrollment-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string; lessonId: string }

// GET — fetch quiz for enrolled student (answers hidden)
export const GET = withTenant<Params>(async (_req, { params, session }) => {
  const enrollment = await getEnrollment(params.courseId, session.userId)
  const isAdmin = ['super_admin', 'instructor'].includes(session.role)

  if (!enrollment && !isAdmin) {
    return NextResponse.json(fail('FORBIDDEN', 'No estás inscrito en este curso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const quiz = await getQuizByLesson(params.lessonId)
  if (!quiz) return NextResponse.json(fail('NOT_FOUND', 'Quiz no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  // Hide correct answers for students
  const safe = isAdmin ? quiz : {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      ...q,
      answers: q.answers.map((a) => ({ id: a.id, text: a.text })),
    })),
  }

  return NextResponse.json(ok(safe))
})

// POST /quiz — save/update quiz (instructor/admin only)
export const POST = withTenant<Params>(async (req, { params, session }) => {
  if (!['super_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = createQuizSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const quiz = await saveQuiz(params.lessonId, { ...parsed.data, lessonId: params.lessonId, courseId: params.courseId })
  return NextResponse.json(ok(quiz), { status: 201 })
})
