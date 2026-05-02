import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createMetaCampaignSchema } from '@/src/modules/marketing/validators'
import { createMetaCampaign, listMetaCampaigns } from '@/src/modules/marketing/campaign-store'
import { DENTAL_TREATMENTS } from '@/src/config/marketing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { DentalTreatmentSlug } from '@/src/types/marketing'

// GET /api/v1/marketing/meta-ads?suggest=implantes-dentales
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const suggest = searchParams.get('suggest') as DentalTreatmentSlug | null

  const campaigns = await listMetaCampaigns(tenant.clinicId)

  const suggestions = suggest && DENTAL_TREATMENTS[suggest]
    ? {
        treatment:        DENTAL_TREATMENTS[suggest].name,
        primaryText:      DENTAL_TREATMENTS[suggest].metaPrimaryText,
        callToAction:     'LEARN_MORE',
        suggestedObjective: 'LEADS',
        audienceSuggestion: {
          ageMin: 25, ageMax: 65,
          interests: ['dental health', 'oral care', 'cosmetic dentistry'],
          radiusKm: 15,
        },
      }
    : null

  return NextResponse.json(ok({ campaigns, suggestions }))
})

// POST /api/v1/marketing/meta-ads
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createMetaCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const adSetsWithIds = parsed.data.adSets.map((s) => ({
    ...s,
    id: crypto.randomUUID(),
    ads: s.ads.map((a) => ({ ...a, id: crypto.randomUUID() })),
  }))
  const campaign = await createMetaCampaign({
    ...parsed.data,
    adSets: adSetsWithIds,
    clinicId: tenant.clinicId,
    status: 'draft',
  })
  return NextResponse.json(ok(campaign), { status: 201 })
})
