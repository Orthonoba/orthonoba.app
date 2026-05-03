import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getCampaignSuggestions } from '@/src/services/ai/campaign-advisor'
import { getMarketingKPIs } from '@/src/modules/marketing/campaign-store'
import { isAIEnabled } from '@/src/services/ai/provider'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/ai/campaigns/suggest?period=2024-05
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? new Date().toISOString().slice(0, 7)

  const kpis = await getMarketingKPIs(tenant.clinicId, period)
  const suggestions = await getCampaignSuggestions(tenant.clinicId, kpis)

  return NextResponse.json(ok({
    suggestions,
    aiEnabled: isAIEnabled(),
    generatedAt: new Date().toISOString(),
  }))
})
