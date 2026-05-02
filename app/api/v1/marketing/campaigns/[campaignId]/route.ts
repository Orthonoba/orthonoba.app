import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getCampaign, updateCampaign, deleteCampaign } from '@/src/modules/marketing/campaign-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { campaignId: string }

export const GET = withTenant<Params>(async (_req, { params, tenant }) => {
  const c = await getCampaign(tenant.clinicId, params.campaignId)
  if (!c) return NextResponse.json(fail('NOT_FOUND', 'Campaña no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  return NextResponse.json(ok(c))
})

export const PATCH = withTenant<Params>(async (req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => ({}))
  const updated = await updateCampaign(tenant.clinicId, params.campaignId, body)
  if (!updated) return NextResponse.json(fail('NOT_FOUND', 'Campaña no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  return NextResponse.json(ok(updated))
})

export const DELETE = withTenant<Params>(async (_req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const deleted = await deleteCampaign(tenant.clinicId, params.campaignId)
  if (!deleted) return NextResponse.json(fail('NOT_FOUND', 'Campaña no encontrada.'), { status: HTTP_STATUS.NOT_FOUND })
  return NextResponse.json(ok({ deleted: true }))
})
