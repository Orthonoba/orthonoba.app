import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { updateLeadSchema } from '@/src/modules/marketing/validators'
import { getLead, updateLead, getLeadActivities } from '@/src/modules/marketing/lead-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { leadId: string }

export const GET = withTenant<Params>(async (_req, { params, tenant }) => {
  const lead = await getLead(tenant.clinicId, params.leadId)
  if (!lead) return NextResponse.json(fail('NOT_FOUND', 'Lead no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
  const activities = await getLeadActivities(params.leadId)
  return NextResponse.json(ok({ lead, activities }))
})

export const PATCH = withTenant<Params>(async (req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = updateLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const updated = await updateLead(tenant.clinicId, params.leadId, parsed.data)
  if (!updated) return NextResponse.json(fail('NOT_FOUND', 'Lead no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })
  return NextResponse.json(ok(updated))
})
