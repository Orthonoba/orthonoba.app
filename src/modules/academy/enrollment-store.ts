import type {
  CourseEnrollment, LessonProgress, CourseProgress,
  QuizAttempt, Certificate, QuizAttemptAnswer,
  AcademyDashboardKPIs,
} from '@/src/types/academy'
import { getCourse, getCourseWithFullContent, getQuizByLesson } from './course-store'
import {
  canAccessCourse, getCertificateVerifyUrl, COMPLETION_THRESHOLD, DEFAULT_CERTIFICATE_TEMPLATE,
} from '@/src/config/academy'
import type { PlanTier } from '@/src/types/clinic'

// ─── In-memory stores ─────────────────────────────────────────────────────────

const enrollments     = new Map<string, CourseEnrollment>()    // key = enrollmentId
const lessonProgress  = new Map<string, LessonProgress[]>()    // key = enrollmentId
const quizAttempts    = new Map<string, QuizAttempt[]>()       // key = enrollmentId:lessonId
const certificates    = new Map<string, Certificate>()         // key = certId
const certsByUser     = new Map<string, string[]>()            // userId → certIds

// ─── Enrollment ───────────────────────────────────────────────────────────────

export async function enrollUser(
  courseId: string,
  userId: string,
  clinicId: string | null,
  planTier: PlanTier,
  paymentIntentId?: string
): Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }> {
  const course = await getCourse(courseId)
  if (!course) return { success: false, error: 'Curso no encontrado.' }
  if (course.status !== 'published') return { success: false, error: 'Curso no disponible.' }

  // Check if already enrolled
  const existing = await getEnrollment(courseId, userId)
  if (existing && existing.status === 'active') {
    return { success: true, enrollment: existing }
  }

  // Check access
  const isPaidCourse = course.accessLevel === 'purchase-only' || course.priceCents > 0
  if (isPaidCourse && !paymentIntentId) {
    if (!canAccessCourse(planTier, course.accessLevel)) {
      return { success: false, error: `Requiere plan ${course.accessLevel} o superior.` }
    }
  }

  const enrollment: CourseEnrollment = {
    id: crypto.randomUUID(),
    courseId,
    userId,
    clinicId,
    status: 'active',
    accessReason: paymentIntentId ? 'direct-purchase'
      : course.priceCents === 0 ? 'free-course'
      : 'plan-subscription',
    stripePaymentIntentId: paymentIntentId,
    amountPaidCents: paymentIntentId ? course.priceCents : 0,
    currency: 'EUR',
    enrolledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }

  enrollments.set(enrollment.id, enrollment)

  // Update course enrollment count
  const updated = await getCourse(courseId)
  if (updated) {
    const { updateCourse } = await import('./course-store')
    await updateCourse(courseId, { enrollmentCount: updated.enrollmentCount + 1 })
  }

  return { success: true, enrollment }
}

export async function getEnrollment(courseId: string, userId: string): Promise<CourseEnrollment | null> {
  for (const e of enrollments.values()) {
    if (e.courseId === courseId && e.userId === userId && e.status === 'active') return e
  }
  return null
}

export async function listUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
  return Array.from(enrollments.values())
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
}

export async function listCourseStudents(courseId: string): Promise<CourseEnrollment[]> {
  return Array.from(enrollments.values())
    .filter((e) => e.courseId === courseId)
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
}

// ─── Lesson Progress ──────────────────────────────────────────────────────────

export async function updateLessonProgress(
  enrollmentId: string,
  lessonId: string,
  courseId: string,
  userId: string,
  update: { videoPositionSeconds?: number; percentComplete?: number }
): Promise<LessonProgress> {
  const now = new Date().toISOString()
  const list = lessonProgress.get(enrollmentId) ?? []
  const idx = list.findIndex((p) => p.lessonId === lessonId)

  let progress: LessonProgress
  if (idx >= 0) {
    progress = {
      ...list[idx],
      ...update,
      lastAccessedAt: now,
      updatedAt: now,
    }
    if ((update.percentComplete ?? 0) >= 100) {
      progress.status = 'completed'
      progress.completedAt = progress.completedAt ?? now
      progress.percentComplete = 100
    } else if ((update.percentComplete ?? 0) > 0) {
      progress.status = 'in-progress'
    }
    list[idx] = progress
  } else {
    progress = {
      id: crypto.randomUUID(),
      enrollmentId,
      lessonId,
      courseId,
      userId,
      status: (update.percentComplete ?? 0) >= 100 ? 'completed' : 'in-progress',
      percentComplete: update.percentComplete ?? 0,
      videoPositionSeconds: update.videoPositionSeconds,
      completedAt: (update.percentComplete ?? 0) >= 100 ? now : undefined,
      lastAccessedAt: now,
      createdAt: now,
      updatedAt: now,
    }
    list.push(progress)
  }

  lessonProgress.set(enrollmentId, list)

  // Update enrollment last accessed
  const enrollment = enrollments.get(enrollmentId)
  if (enrollment) enrollments.set(enrollmentId, { ...enrollment, lastAccessedAt: now })

  // Check for course completion
  await checkCourseCompletion(enrollmentId, courseId, userId)

  return progress
}

export async function markLessonComplete(
  enrollmentId: string,
  lessonId: string,
  courseId: string,
  userId: string
): Promise<LessonProgress> {
  return updateLessonProgress(enrollmentId, lessonId, courseId, userId, { percentComplete: 100 })
}

// ─── Course Progress ──────────────────────────────────────────────────────────

export async function getCourseProgress(enrollmentId: string, courseId: string, userId: string): Promise<CourseProgress> {
  const course = getCourseWithFullContent(courseId)
  const allLessons = course?.sections.flatMap((s) => s.lessons) ?? []
  const totalLessons = allLessons.length

  const progressList = lessonProgress.get(enrollmentId) ?? []
  const completedLessons = progressList.filter((p) => p.status === 'completed').length
  const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const lastProgress = progressList.sort((a, b) =>
    new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
  )[0]

  const completedMinutes = progressList
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => {
      const lesson = allLessons.find((l) => l.id === p.lessonId)
      return sum + (lesson?.durationMinutes ?? Math.round((lesson?.video?.durationSeconds ?? 0) / 60))
    }, 0)

  const totalMinutes = course?.totalMinutes ?? 0
  const minutesRemaining = Math.max(0, totalMinutes - completedMinutes)

  return {
    enrollmentId,
    courseId,
    userId,
    totalLessons,
    completedLessons,
    percentComplete,
    lastLessonId: lastProgress?.lessonId,
    lastAccessedAt: lastProgress?.lastAccessedAt,
    minutesRemaining,
    lessonProgress: progressList,
  }
}

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export async function submitQuizAttempt(
  enrollmentId: string,
  lessonId: string,
  userId: string,
  answers: { questionId: string; selectedAnswerIds: string[]; textAnswer?: string }[],
  timeTakenSeconds?: number
): Promise<{ attempt: QuizAttempt; passed: boolean; canRetry: boolean }> {
  const quiz = await getQuizByLesson(lessonId)
  if (!quiz) throw new Error('Quiz no encontrado')

  const attemptKey = `${enrollmentId}:${lessonId}`
  const prevAttempts = quizAttempts.get(attemptKey) ?? []

  if (prevAttempts.length >= quiz.maxAttempts) {
    throw new Error(`Límite de intentos alcanzado (${quiz.maxAttempts})`)
  }

  // Grade answers
  let totalPoints = 0
  let earnedPoints = 0

  const gradedAnswers: QuizAttemptAnswer[] = answers.map((a) => {
    const question = quiz.questions.find((q) => q.id === a.questionId)
    if (!question) return { ...a, isCorrect: false, pointsEarned: 0 }

    totalPoints += question.points
    const correctIds = question.answers.filter((ans) => ans.isCorrect).map((ans) => ans.id)
    const isCorrect = question.type === 'short-answer'
      ? false  // manual grading — TODO: AI-assisted grading
      : correctIds.length === a.selectedAnswerIds.length &&
        a.selectedAnswerIds.every((id) => correctIds.includes(id))

    const points = isCorrect ? question.points : 0
    earnedPoints += points
    return { questionId: a.questionId, selectedAnswerIds: a.selectedAnswerIds, textAnswer: a.textAnswer, isCorrect, pointsEarned: points }
  })

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = score >= quiz.passingScore

  const attempt: QuizAttempt = {
    id: crypto.randomUUID(),
    quizId: quiz.id,
    lessonId,
    enrollmentId,
    userId,
    answers: gradedAnswers,
    score,
    passed,
    attemptNumber: prevAttempts.length + 1,
    timeTakenSeconds,
    submittedAt: new Date().toISOString(),
  }

  prevAttempts.push(attempt)
  quizAttempts.set(attemptKey, prevAttempts)

  // Mark lesson progress
  if (passed) {
    const { getCourse: getCourseData } = await import('./course-store')
    const course = await getCourseData(quiz.courseId)
    if (course) {
      await updateLessonProgress(enrollmentId, lessonId, quiz.courseId, userId, { percentComplete: 100 })
      const updated = lessonProgress.get(enrollmentId) ?? []
      const idx = updated.findIndex((p) => p.lessonId === lessonId)
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          quizAttempts: attempt.attemptNumber,
          bestQuizScore: Math.max(updated[idx].bestQuizScore ?? 0, score),
          quizPassedAt: attempt.submittedAt,
        }
        lessonProgress.set(enrollmentId, updated)
      }
    }
  }

  const canRetry = !passed && (prevAttempts.length < quiz.maxAttempts)

  return { attempt, passed, canRetry }
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export async function issueCertificate(
  enrollment: CourseEnrollment,
  userName: string,
  courseTitle: string,
  instructorNames: string[],
  hoursCompleted: number,
  finalScore?: number
): Promise<Certificate> {
  // Check not already issued
  const existing = await getCertificateForEnrollment(enrollment.id)
  if (existing) return existing

  const cert: Certificate = {
    id: crypto.randomUUID(),
    verificationId: crypto.randomUUID(),
    enrollmentId: enrollment.id,
    courseId: enrollment.courseId,
    userId: enrollment.userId,
    userName,
    courseTitle,
    instructorNames,
    issuedAt: new Date().toISOString(),
    status: 'issued',
    finalScore,
    hoursCompleted,
    templateId: DEFAULT_CERTIFICATE_TEMPLATE,
    metadata: {
      verifyUrl: getCertificateVerifyUrl(crypto.randomUUID()),
    },
  }

  cert.metadata.verifyUrl = getCertificateVerifyUrl(cert.verificationId)

  certificates.set(cert.id, cert)

  // Index by user
  const userCerts = certsByUser.get(enrollment.userId) ?? []
  userCerts.push(cert.id)
  certsByUser.set(enrollment.userId, userCerts)

  // Mark enrollment as completed
  const e = enrollments.get(enrollment.id)
  if (e) {
    enrollments.set(enrollment.id, { ...e, status: 'completed', completedAt: cert.issuedAt })
  }

  return cert
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  return certificates.get(id) ?? null
}

export async function getCertificateByVerificationId(verificationId: string): Promise<Certificate | null> {
  for (const cert of certificates.values()) {
    if (cert.verificationId === verificationId) return cert
  }
  return null
}

export async function getCertificateForEnrollment(enrollmentId: string): Promise<Certificate | null> {
  for (const cert of certificates.values()) {
    if (cert.enrollmentId === enrollmentId) return cert
  }
  return null
}

export async function getCertificateForUserCourse(userId: string, courseId: string): Promise<Certificate | null> {
  const certIds = certsByUser.get(userId) ?? []
  for (const id of certIds) {
    const cert = certificates.get(id)
    if (cert?.courseId === courseId) return cert
  }
  return null
}

export async function listUserCertificates(userId: string): Promise<Certificate[]> {
  const certIds = certsByUser.get(userId) ?? []
  return certIds.map((id) => certificates.get(id)).filter(Boolean) as Certificate[]
}

// ─── Course completion check ─────────────────────────────────────────────────���

async function checkCourseCompletion(enrollmentId: string, courseId: string, userId: string) {
  const progress = await getCourseProgress(enrollmentId, courseId, userId)
  if (progress.percentComplete < COMPLETION_THRESHOLD) return

  const enrollment = enrollments.get(enrollmentId)
  if (!enrollment || enrollment.status === 'completed') return

  // Fetch course + instructor names for certificate
  const course = await getCourse(courseId)
  if (!course || !course.grantsCertificate) return

  const { listInstructors } = await import('./course-store')
  const allInstructors = await listInstructors()
  const courseInstructors = allInstructors.filter((i) => course.instructorIds.includes(i.id))
  const instructorNames = courseInstructors.map((i) => i.name)

  // TODO: get user name from IUserRepository
  const hoursCompleted = Math.round((course.totalMinutes * (progress.percentComplete / 100)) / 60)

  await issueCertificate(
    enrollment,
    'Student Name',  // TODO: resolve from user store
    course.certificateTitle ?? course.title,
    instructorNames,
    hoursCompleted
  )
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export async function getAcademyDashboard(userId: string): Promise<AcademyDashboardKPIs> {
  const userEnrollments = await listUserEnrollments(userId)
  const userCerts = await listUserCertificates(userId)

  const completed   = userEnrollments.filter((e) => e.status === 'completed').length
  const inProgress  = userEnrollments.filter((e) => e.status === 'active').length

  const totalMinutesLearned = await Promise.all(
    userEnrollments.map(async (e) => {
      const course = await getCourse(e.courseId)
      if (!course) return 0
      const prog = await getCourseProgress(e.id, e.courseId, userId)
      return Math.round(course.totalMinutes * (prog.percentComplete / 100))
    })
  ).then((mins) => mins.reduce((s, m) => s + m, 0))

  return {
    userId,
    totalEnrollments: userEnrollments.length,
    completedCourses: completed,
    inProgressCourses: inProgress,
    totalCertificates: userCerts.length,
    totalMinutesLearned,
    currentStreak: 0,    // TODO: compute from daily activity log
    longestStreak: 0,
    avgCourseScore: 0,
    categoryProgress: [],
    recentActivity: [],
  }
}

// ─── Course analytics (for instructors) ──────────────────────────────────────

export async function getCourseAnalytics(courseId: string) {
  const courseEnrollments = await listCourseStudents(courseId)
  const course = await getCourse(courseId)

  const completed  = courseEnrollments.filter((e) => e.status === 'completed').length
  const active     = courseEnrollments.filter((e) => e.status === 'active').length
  const totalRevenue = courseEnrollments.reduce((s, e) => s + e.amountPaidCents, 0)

  const completionRate = courseEnrollments.length > 0
    ? Math.round((completed / courseEnrollments.length) * 100)
    : 0

  return {
    courseId,
    totalEnrollments: courseEnrollments.length,
    activeStudents: active,
    completedStudents: completed,
    completionRate,
    totalRevenueEurCents: totalRevenue,
    avgRating: course?.avgRating ?? 0,
    reviewCount: course?.reviewCount ?? 0,
  }
}
