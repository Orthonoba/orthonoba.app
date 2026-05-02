import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { listTemplates } from '@/src/modules/marketing/campaign-store'
import { DENTAL_TREATMENTS } from '@/src/config/marketing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/marketing/templates?category=google-ad&treatment=implantes-dentales
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') ?? undefined

  const templates = await listTemplates(tenant.clinicId, category)

  // If no templates exist yet, return built-in dental templates from config
  const builtIn = Object.values(DENTAL_TREATMENTS).map((t) => ({
    id:        `builtin-${t.slug}`,
    name:      `${t.name} — Anuncio Tipo`,
    category:  'google-ad',
    treatment: t.slug,
    clinicId:  null,
    body:      t.adHeadlines.join(' | '),
    variables: ['clinic_name', 'location', 'price'],
    isDefault: true,
    language:  'es',
    createdAt: '2024-01-01T00:00:00Z',
  }))

  return NextResponse.json(ok({ templates, builtIn }))
})
