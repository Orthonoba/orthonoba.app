import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createGoogleAdsCampaignSchema } from '@/src/modules/marketing/validators'
import { createGoogleAdsCampaign, listGoogleAdsCampaigns } from '@/src/modules/marketing/campaign-store'
import { DENTAL_TREATMENTS } from '@/src/config/marketing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { DentalTreatmentSlug } from '@/src/types/marketing'

// GET /api/v1/marketing/google-ads
// ?suggest=implantes-dentales — returns keyword & ad suggestions for treatment
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const suggest = searchParams.get('suggest') as DentalTreatmentSlug | null

  const campaigns = await listGoogleAdsCampaigns(tenant.clinicId)

  const suggestions = suggest && DENTAL_TREATMENTS[suggest]
    ? {
        treatment: DENTAL_TREATMENTS[suggest].name,
        primaryKeywords:  DENTAL_TREATMENTS[suggest].primaryKeywords,
        longTailKeywords: DENTAL_TREATMENTS[suggest].longTailKeywords,
        adHeadlines:      DENTAL_TREATMENTS[suggest].adHeadlines,
        dailyBudgetSuggestion: Math.round(DENTAL_TREATMENTS[suggest].avgTicketEUR * 0.05 * 100),
      }
    : null

  return NextResponse.json(ok({ campaigns, suggestions }))
})

// POST /api/v1/marketing/google-ads
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createGoogleAdsCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  // Validate ad headlines (max 30 chars each)
  for (const group of parsed.data.adGroups) {
    for (const ad of group.ads) {
      const longHeadline = ad.headlines.find((h) => h.length > 30)
      if (longHeadline) {
        return NextResponse.json(
          fail('VALIDATION_ERROR', `Headline demasiado largo (max 30 chars): "${longHeadline}"`),
          { status: HTTP_STATUS.VALIDATION_ERROR }
        )
      }
      const longDesc = ad.descriptions.find((d) => d.length > 90)
      if (longDesc) {
        return NextResponse.json(
          fail('VALIDATION_ERROR', `Description demasiado larga (max 90 chars): "${longDesc}"`),
          { status: HTTP_STATUS.VALIDATION_ERROR }
        )
      }
    }
  }

  const adGroupsWithIds = parsed.data.adGroups.map((g) => ({
    ...g,
    id: crypto.randomUUID(),
    ads: g.ads.map((a) => ({ ...a, id: crypto.randomUUID() })),
  }))
  const campaign = await createGoogleAdsCampaign({
    ...parsed.data,
    adGroups: adGroupsWithIds,
    clinicId: tenant.clinicId,
    status: 'draft',
  })
  return NextResponse.json(ok(campaign), { status: 201 })
})
