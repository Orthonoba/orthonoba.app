import type {
  Course, CourseSection, Lesson, Instructor, Quiz,
  CourseReview, LiveSession,
} from '@/src/types/academy'
import type { CourseCategory, CourseStatus } from '@/src/types/academy'

// ─── In-memory stores (swap → Neon DB) ───────────────────────────────────────

const courses     = new Map<string, Course>()
const sections    = new Map<string, CourseSection>()     // key = sectionId
const lessons     = new Map<string, Lesson>()            // key = lessonId
const quizzes     = new Map<string, Quiz>()              // key = lessonId
const instructors = new Map<string, Instructor>()        // key = instructorId
const reviews     = new Map<string, CourseReview[]>()    // key = courseId
const liveSessions = new Map<string, LiveSession>()

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function createCourse(
  data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'sections' | 'totalLessons' | 'totalMinutes' | 'enrollmentCount' | 'completionRate' | 'avgRating' | 'reviewCount'>
): Promise<Course> {
  const now = new Date().toISOString()
  const course: Course = {
    ...data,
    id: crypto.randomUUID(),
    sections: [],
    totalLessons: 0,
    totalMinutes: 0,
    enrollmentCount: 0,
    completionRate: 0,
    avgRating: 0,
    reviewCount: 0,
    createdAt: now,
  }
  courses.set(course.id, course)
  return course
}

export async function getCourse(id: string): Promise<Course | null> {
  return courses.get(id) ?? null
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  for (const c of courses.values()) {
    if (c.slug === slug) return c
  }
  return null
}

export interface CourseFilters {
  category?: CourseCategory
  status?: CourseStatus
  accessLevel?: string
  search?: string
  instructorId?: string
  page?: number
  limit?: number
}

export async function listCourses(
  filters: CourseFilters = {}
): Promise<{ data: Course[]; total: number }> {
  let result = Array.from(courses.values()).filter((c) => c.status === 'published' || filters.status)

  if (filters.status)      result = result.filter((c) => c.status === filters.status)
  if (filters.category)    result = result.filter((c) => c.category === filters.category)
  if (filters.accessLevel) result = result.filter((c) => c.accessLevel === filters.accessLevel)
  if (filters.instructorId) result = result.filter((c) => c.instructorIds.includes(filters.instructorId!))
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  result.sort((a, b) => b.enrollmentCount - a.enrollmentCount)

  const page  = filters.page  ?? 1
  const limit = filters.limit ?? 20
  return { data: result.slice((page - 1) * limit, page * limit), total: result.length }
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course | null> {
  const c = courses.get(id)
  if (!c) return null
  const updated = { ...c, ...data, updatedAt: new Date().toISOString() }
  courses.set(id, updated)
  return updated
}

export async function deleteCourse(id: string): Promise<boolean> {
  return courses.delete(id)
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export async function createSection(
  courseId: string,
  data: Omit<CourseSection, 'id' | 'courseId' | 'createdAt' | 'lessons'>
): Promise<CourseSection> {
  const section: CourseSection = {
    ...data,
    id: crypto.randomUUID(),
    courseId,
    lessons: [],
    createdAt: new Date().toISOString(),
  }
  sections.set(section.id, section)

  // Attach to course
  const course = courses.get(courseId)
  if (course) {
    courses.set(courseId, { ...course, sections: [...course.sections, section] })
  }

  return section
}

export async function getSection(sectionId: string): Promise<CourseSection | null> {
  return sections.get(sectionId) ?? null
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function createLesson(
  courseId: string,
  sectionId: string,
  data: Omit<Lesson, 'id' | 'courseId' | 'sectionId' | 'createdAt' | 'updatedAt'>
): Promise<Lesson> {
  const lesson: Lesson = {
    ...data,
    id: crypto.randomUUID(),
    courseId,
    sectionId,
    createdAt: new Date().toISOString(),
  }
  lessons.set(lesson.id, lesson)

  // Attach to section
  const section = sections.get(sectionId)
  if (section) {
    sections.set(sectionId, { ...section, lessons: [...section.lessons, lesson] })
  }

  // Update course totals
  await recalculateCourseTotals(courseId)
  return lesson
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  return lessons.get(lessonId) ?? null
}

export async function updateLesson(lessonId: string, data: Partial<Lesson>): Promise<Lesson | null> {
  const l = lessons.get(lessonId)
  if (!l) return null
  const updated = { ...l, ...data, updatedAt: new Date().toISOString() }
  lessons.set(lessonId, updated)
  return updated
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export async function saveQuiz(lessonId: string, quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
  const q: Quiz = { ...quiz, id: crypto.randomUUID() }
  quizzes.set(lessonId, q)
  // Embed in lesson
  await updateLesson(lessonId, { quiz: q })
  return q
}

export async function getQuizByLesson(lessonId: string): Promise<Quiz | null> {
  return quizzes.get(lessonId) ?? null
}

// ─── Instructors ──────────────────────────────────────────────────────────────

export async function createInstructor(
  data: Omit<Instructor, 'id' | 'courseCount' | 'avgRating' | 'totalStudents' | 'createdAt' | 'updatedAt'>
): Promise<Instructor> {
  const instructor: Instructor = {
    ...data,
    id: crypto.randomUUID(),
    courseCount: 0,
    avgRating: 0,
    totalStudents: 0,
    createdAt: new Date().toISOString(),
  }
  instructors.set(instructor.id, instructor)
  return instructor
}

export async function getInstructor(id: string): Promise<Instructor | null> {
  return instructors.get(id) ?? null
}

export async function getInstructorByUserId(userId: string): Promise<Instructor | null> {
  for (const inst of instructors.values()) {
    if (inst.userId === userId) return inst
  }
  return null
}

export async function listInstructors(): Promise<Instructor[]> {
  return Array.from(instructors.values()).sort((a, b) => b.totalStudents - a.totalStudents)
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function addReview(review: Omit<CourseReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseReview> {
  const r: CourseReview = { ...review, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  const existing = reviews.get(review.courseId) ?? []
  existing.push(r)
  reviews.set(review.courseId, existing)
  await updateCourseRating(review.courseId)
  return r
}

export async function listReviews(courseId: string): Promise<CourseReview[]> {
  return (reviews.get(courseId) ?? []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function recalculateCourseTotals(courseId: string) {
  const course = courses.get(courseId)
  if (!course) return

  let totalLessons = 0
  let totalMinutes = 0

  for (const section of course.sections) {
    const sectionData = sections.get(section.id)
    if (!sectionData) continue
    for (const lessonRef of sectionData.lessons) {
      const lessonData = lessons.get(lessonRef.id)
      if (!lessonData) continue
      totalLessons++
      totalMinutes += lessonData.durationMinutes ?? Math.round((lessonData.video?.durationSeconds ?? 0) / 60)
    }
  }

  courses.set(courseId, { ...course, totalLessons, totalMinutes })
}

async function updateCourseRating(courseId: string) {
  const course = courses.get(courseId)
  if (!course) return
  const courseReviews = reviews.get(courseId) ?? []
  if (courseReviews.length === 0) return
  const avg = courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length
  courses.set(courseId, { ...course, avgRating: Math.round(avg * 10) / 10, reviewCount: courseReviews.length })
}

export function getCourseWithFullContent(id: string): Course | null {
  const course = courses.get(id)
  if (!course) return null

  const fullSections = course.sections.map((s) => {
    const sectionData = sections.get(s.id)
    if (!sectionData) return s
    const fullLessons = sectionData.lessons.map((l) => lessons.get(l.id) ?? l)
    return { ...sectionData, lessons: fullLessons }
  })

  return { ...course, sections: fullSections }
}
