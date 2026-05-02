import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getEnrollment, getCourseProgress } from '@/src/modules/academy/enrollment-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string }

// GET /api/v1/courses/:courseId/progress
export const GET = withTenant<Params>(async (_req, { params, session }) => {
  const enrollment = await getEnrollment(params.courseId, session.userId)
  if (!enrollment) {
    return NextResponse.json(fail('NOT_FOUND', 'No estás inscrito en este curso.'), { status: HTTP_STATUS.NOT_FOUND })
  }
  const progress = await getCourseProgress(enrollment.id, params.courseId, session.userId)
  return NextResponse.json(ok(progress))
})
