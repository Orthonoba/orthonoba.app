import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createCampaignSchema } from '@/src/modules/marketing/validators'
import { createCampaign, listCampaigns } from '@/src/modules/marketing/campaign-store'
import { ok, fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Campaign } from '@/src/types/marketing'

// GET /api/v1/marketing/campaigns
export const GET = withTenant(async (_req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const data = await listCampaigns(tenant.clinicId)
  return NextResponse.json(paginated<Campaign>(data, data.length, 1, 100))
})

// POST /api/v1/marketing/campaigns
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const campaign = await createCampaign({ ...parsed.data, clinicId: tenant.clinicId, status: 'draft' })
  return NextResponse.json(ok(campaign), { status: 201 })
})
