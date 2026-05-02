import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import {
  listUserEnrollments, listUserCertificates,
  getCourseProgress, getAcademyDashboard,
} from '@/src/modules/academy/enrollment-store'
import { getCourse } from '@/src/modules/academy/course-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/courses/my — my enrollments, certificates, and dashboard KPIs
export const GET = withTenant(async (req, { session }) => {
  const { searchParams } = new URL(req.url)
  const view = searchParams.get('view') ?? 'enrollments'

  if (view === 'dashboard') {
    const kpis = await getAcademyDashboard(session.userId)
    return NextResponse.json(ok(kpis))
  }

  if (view === 'certificates') {
    const certs = await listUserCertificates(session.userId)
    return NextResponse.json(ok(certs))
  }

  // Default: enrollments with progress
  const rawEnrollments = await listUserEnrollments(session.userId)

  const withProgress = await Promise.all(
    rawEnrollments.map(async (enrollment) => {
      const [course, progress] = await Promise.all([
        getCourse(enrollment.courseId),
        getCourseProgress(enrollment.id, enrollment.courseId, session.userId),
      ])
      return {
        enrollment,
        course: course ? {
          id: course.id,
          slug: course.slug,
          title: course.title,
          category: course.category,
          thumbnailUrl: course.thumbnailUrl,
          totalLessons: course.totalLessons,
          totalMinutes: course.totalMinutes,
          grantsCertificate: course.grantsCertificate,
        } : null,
        progress: {
          percentComplete: progress.percentComplete,
          completedLessons: progress.completedLessons,
          totalLessons: progress.totalLessons,
          lastLessonId: progress.lastLessonId,
          lastAccessedAt: progress.lastAccessedAt,
          minutesRemaining: progress.minutesRemaining,
        },
      }
    })
  )

  return NextResponse.json(ok(withProgress))
})
