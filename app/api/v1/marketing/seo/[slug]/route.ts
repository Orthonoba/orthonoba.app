import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getSeoPage } from '@/src/modules/marketing/campaign-store'
import { buildDentistSchema, buildFAQSchema } from '@/src/config/marketing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { slug: string }

// GET /api/v1/marketing/seo/:slug — returns page + structured data
export const GET = withTenant<Params>(async (_req, { params, tenant }) => {
  const page = await getSeoPage(tenant.clinicId, params.slug)
  if (!page) return NextResponse.json(fail('NOT_FOUND', 'Página SEO no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })

  const faqBlock = page.contentBlocks.find((b) => b.type === 'faq')
  const faqs = faqBlock?.items?.reduce<{ question: string; answer: string }[]>((acc, item, i, arr) => {
    if (i % 2 === 0) acc.push({ question: item, answer: arr[i + 1] ?? '' })
    return acc
  }, []) ?? []

  const structuredData = [
    buildDentistSchema({
      name: tenant.clinicName,
      address: '',
      phone: '',
      url: `https://${tenant.subdomain}.orthonoba.app`,
    }),
    ...(faqs.length > 0 ? [buildFAQSchema(faqs)] : []),
  ]

  return NextResponse.json(ok({ page, structuredData }))
})

// PATCH /api/v1/marketing/seo/:slug
export const PATCH = withTenant<Params>(async (req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const page = await getSeoPage(tenant.clinicId, params.slug)
  if (!page) return NextResponse.json(fail('NOT_FOUND', 'Página SEO no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })

  const body = await req.json().catch(() => ({}))
  const now = new Date().toISOString()
  const updated = { ...page, ...body, updatedAt: now }

  // Re-index in store
  const store = await import('@/src/modules/marketing/campaign-store')
  await store.createSeoPage({ ...updated, clinicId: tenant.clinicId })

  return NextResponse.json(ok(updated))
})
