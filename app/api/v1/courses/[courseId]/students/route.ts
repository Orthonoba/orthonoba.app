import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getCourse, getInstructorByUserId } from '@/src/modules/academy/course-store'
import { listCourseStudents, getCourseProgress } from '@/src/modules/academy/enrollment-store'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'


type Params = { courseId: string }

// GET /api/v1/courses/:courseId/students — instructor/admin only
export const GET = withTenant<Params>(async (req, { params, session }) => {
  if (!['super_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo instructores y admins.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const course = await getCourse(params.courseId)
  if (!course) return NextResponse.json(fail('NOT_FOUND', 'Curso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  // Instructor can only see students of their own courses
  if (session.role === 'instructor') {
    const instructor = await getInstructorByUserId(session.userId)
    if (!instructor || !course.instructorIds.includes(instructor.id)) {
      return NextResponse.json(fail('FORBIDDEN', 'No tienes acceso a este curso.'), { status: HTTP_STATUS.FORBIDDEN })
    }
  }

  const { searchParams } = new URL(req.url)
  const page  = Number(searchParams.get('page')  ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')

  const all = await listCourseStudents(params.courseId)
  const total = all.length
  const slice = all.slice((page - 1) * limit, page * limit)

  // Attach progress percentage
  const withProgress = await Promise.all(
    slice.map(async (enrollment) => {
      const progress = await getCourseProgress(enrollment.id, params.courseId, enrollment.userId)
      return { enrollment, percentComplete: progress.percentComplete, completedLessons: progress.completedLessons }
    })
  )

  return NextResponse.json(paginated(withProgress, total, page, limit))
})
