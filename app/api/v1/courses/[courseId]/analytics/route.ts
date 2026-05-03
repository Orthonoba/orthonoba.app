import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getCourse, getInstructorByUserId, listReviews } from '@/src/modules/academy/course-store'
import { getCourseAnalytics } from '@/src/modules/academy/enrollment-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string }

// GET /api/v1/courses/:courseId/analytics — instructor/admin only
export const GET = withTenant<Params>(async (_req, { params, session }) => {
  if (!['super_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo instructores y admins.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const course = await getCourse(params.courseId)
  if (!course) return NextResponse.json(fail('NOT_FOUND', 'Curso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  if (session.role === 'instructor') {
    const instructor = await getInstructorByUserId(session.userId)
    if (!instructor || !course.instructorIds.includes(instructor.id)) {
      return NextResponse.json(fail('FORBIDDEN', 'No tienes acceso a este curso.'), { status: HTTP_STATUS.FORBIDDEN })
    }
  }

  const [analytics, reviews] = await Promise.all([
    getCourseAnalytics(params.courseId),
    listReviews(params.courseId),
  ])

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return NextResponse.json(ok({ ...analytics, ratingDistribution, recentReviews: reviews.slice(0, 5) }))
})
