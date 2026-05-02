import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createSocialPostSchema } from '@/src/modules/marketing/validators'
import { createSocialPost, listSocialPosts } from '@/src/modules/marketing/campaign-store'
import { DENTAL_HASHTAGS } from '@/src/config/marketing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { DentalTreatmentSlug } from '@/src/types/marketing'

// GET /api/v1/marketing/social/posts?treatment=implantes-dentales — hashtag suggestions
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const treatment = searchParams.get('treatment') as DentalTreatmentSlug | null

  const posts = await listSocialPosts(tenant.clinicId)
  const hashtagSuggestions = treatment ? DENTAL_HASHTAGS[treatment] ?? [] : []

  return NextResponse.json(ok({ posts, hashtagSuggestions }))
})

// POST /api/v1/marketing/social/posts
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createSocialPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const status = parsed.data.scheduledAt ? 'scheduled' : 'draft'
  const post = await createSocialPost({ ...parsed.data, clinicId: tenant.clinicId, status })
  return NextResponse.json(ok(post), { status: 201 })
})
