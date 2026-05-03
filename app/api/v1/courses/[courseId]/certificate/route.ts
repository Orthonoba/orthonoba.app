import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import {
  getEnrollment, getCertificateForUserCourse,
  issueCertificate, getCourseProgress,
} from '@/src/modules/academy/enrollment-store'
import { getCourse, listInstructors } from '@/src/modules/academy/course-store'
import { COMPLETION_THRESHOLD, getCertificateVerifyUrl } from '@/src/config/academy'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { courseId: string }

// GET /api/v1/courses/:courseId/certificate — get or issue certificate
export const GET = withTenant<Params>(async (_req, { params, session }) => {
  const enrollment = await getEnrollment(params.courseId, session.userId)
  if (!enrollment) {
    return NextResponse.json(fail('NOT_FOUND', 'No estás inscrito en este curso.'), { status: HTTP_STATUS.NOT_FOUND })
  }

  // Return existing certificate if already issued
  const existing = await getCertificateForUserCourse(session.userId, params.courseId)
  if (existing) {
    return NextResponse.json(ok({
      certificate: existing,
      verifyUrl: getCertificateVerifyUrl(existing.verificationId),
    }))
  }

  // Check completion threshold
  const progress = await getCourseProgress(enrollment.id, params.courseId, session.userId)
  if (progress.percentComplete < COMPLETION_THRESHOLD) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', `Debes completar al menos el ${COMPLETION_THRESHOLD}% del curso (actual: ${progress.percentComplete}%).`),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const course = await getCourse(params.courseId)
  if (!course) return NextResponse.json(fail('NOT_FOUND', 'Curso no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  if (!course.grantsCertificate) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Este curso no emite certificado.'), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const allInstructors = await listInstructors()
  const courseInstructors = allInstructors.filter((i) => course.instructorIds.includes(i.id))
  const hoursCompleted = Math.round((course.totalMinutes * (progress.percentComplete / 100)) / 60)

  // TODO: resolve real userName from IUserRepository
  const cert = await issueCertificate(
    enrollment,
    'Student',
    course.certificateTitle ?? course.title,
    courseInstructors.map((i) => i.name),
    hoursCompleted
  )

  return NextResponse.json(ok({
    certificate: cert,
    verifyUrl: getCertificateVerifyUrl(cert.verificationId),
  }), { status: 201 })
})
