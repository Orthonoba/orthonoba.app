import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { trackMetricSchema } from '@/src/modules/marketing/validators'
import { trackMetric, getCampaignAnalytics } from '@/src/modules/marketing/campaign-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { campaignId: string }

// GET /api/v1/marketing/campaigns/:id/metrics?period=2024-05
export const GET = withTenant<Params>(async (req, { params, tenant }) => {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? new Date().toISOString().slice(0, 7)
  const analytics = await getCampaignAnalytics(tenant.clinicId, params.campaignId, period)
  return NextResponse.json(ok(analytics))
})

// POST /api/v1/marketing/campaigns/:id/metrics — ingest daily snapshot
export const POST = withTenant<Params>(async (req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = trackMetricSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const metric = await trackMetric({ ...parsed.data, clinicId: tenant.clinicId, campaignId: params.campaignId })
  return NextResponse.json(ok(metric), { status: 201 })
})
