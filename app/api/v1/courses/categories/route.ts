import { NextResponse } from 'next/server'
import { ACADEMY_CATEGORIES } from '@/src/config/academy'
import { listCourses } from '@/src/modules/academy/course-store'
import { ok } from '@/src/types/api'

// GET /api/v1/courses/categories — public, with course counts per category
export async function GET() {
  const { data: allCourses } = await listCourses({ limit: 1000 })

  const categories = Object.values(ACADEMY_CATEGORIES)
    .sort((a, b) => a.featuredOrder - b.featuredOrder)
    .map((cat) => ({
      ...cat,
      courseCount: allCourses.filter((c) => c.category === cat.slug).length,
    }))

  return NextResponse.json(ok(categories), {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
