import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createSeoPageSchema } from '@/src/modules/marketing/validators'
import { createSeoPage, listSeoPages } from '@/src/modules/marketing/campaign-store'
import { buildDentistSchema } from '@/src/config/marketing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/marketing/seo
export const GET = withTenant(async (_req, { tenant }) => {
  const pages = await listSeoPages(tenant.clinicId)
  return NextResponse.json(ok(pages))
})

// POST /api/v1/marketing/seo
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createSeoPageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const existingCheck = await import('@/src/modules/marketing/campaign-store').then(m => m.getSeoPage(tenant.clinicId, parsed.data.slug))
  if (existingCheck) {
    return NextResponse.json(fail('CONFLICT', 'Ya existe una página con ese slug.'), { status: HTTP_STATUS.CONFLICT })
  }

  const page = await createSeoPage({ ...parsed.data, clinicId: tenant.clinicId, isPublished: false })
  return NextResponse.json(ok(page), { status: 201 })
})
