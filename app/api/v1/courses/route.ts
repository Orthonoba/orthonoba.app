import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createCourseSchema } from '@/src/modules/academy/validators'
import { createCourse, listCourses, getInstructorByUserId } from '@/src/modules/academy/course-store'
import { ACADEMY_CATEGORIES } from '@/src/config/academy'
import { ok, fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Course, CourseCategory } from '@/src/types/academy'

// GET /api/v1/courses — public catalog with plan-based access hints
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filters = {
    category:    (searchParams.get('category') as CourseCategory) ?? undefined,
    search:      searchParams.get('q') ?? undefined,
    accessLevel: searchParams.get('access') ?? undefined,
    page:        Number(searchParams.get('page')  ?? '1'),
    limit:       Number(searchParams.get('limit') ?? '12'),
  }

  const { data, total } = await listCourses(filters)

  // Strip quiz answers from public listing
  const safe = data.map(sanitizeCourseForPublic)

  return NextResponse.json({
    ...paginated<Course>(safe, total, filters.page, filters.limit),
    categories: Object.values(ACADEMY_CATEGORIES).sort((a, b) => a.featuredOrder - b.featuredOrder),
  })
}

// POST /api/v1/courses — create course (instructor / super_admin only)
export const POST = withTenant(async (req, { session }) => {
  if (!['super_admin', 'instructor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Solo instructores pueden crear cursos.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const body = await req.json().catch(() => null)
  const parsed = createCourseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  // Instructor can only assign themselves
  if (session.role === 'instructor') {
    const instructor = await getInstructorByUserId(session.userId)
    if (!instructor) {
      return NextResponse.json(fail('NOT_FOUND', 'Perfil de instructor no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
    }
    if (!parsed.data.instructorIds.includes(instructor.id)) {
      return NextResponse.json(fail('FORBIDDEN', 'No puedes asignar otros instructores.'), { status: HTTP_STATUS.FORBIDDEN })
    }
  }

  const course = await createCourse({ ...parsed.data, status: 'draft' })
  return NextResponse.json(ok(course), { status: 201 })
})

export function sanitizeCourseForPublic(course: Course): Course {
  return {
    ...course,
    sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        ...lesson,
        content:   lesson.isFreePreview ? lesson.content : undefined,
        video:     lesson.isFreePreview ? lesson.video : lesson.video ? { ...lesson.video, streamUrl: undefined, videoId: '' } : undefined,
        quiz:      undefined,    // never expose quiz answers in catalog
        resources: lesson.isFreePreview ? lesson.resources : undefined,
      })),
    })),
  }
}
