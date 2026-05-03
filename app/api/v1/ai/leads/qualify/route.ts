import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { qualifyLeadQuerySchema } from '@/src/modules/automation/validators'
import { getLead, getLeadActivities } from '@/src/modules/marketing/lead-store'
import { qualifyLead, qualifyLeadBatch } from '@/src/services/ai/lead-qualifier'
import { isAIEnabled } from '@/src/services/ai/provider'
import { listLeads } from '@/src/modules/marketing/lead-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/ai/leads/qualify?leadId=&withHistory=true — single lead
// GET /api/v1/ai/leads/qualify?batch=true&limit=20 — batch qualify top leads
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const isBatch = searchParams.get('batch') === 'true'

  if (isBatch) {
    const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50)
    const { data: leads } = await listLeads(tenant.clinicId, { status: 'new', limit })
    const pairs = await Promise.all(
      leads.map(async (lead) => ({ lead, activities: await getLeadActivities(lead.id) }))
    )
    const qualifications = await qualifyLeadBatch(pairs)
    return NextResponse.json(ok({
      qualifications,
      aiEnabled: isAIEnabled(),
      processedAt: new Date().toISOString(),
    }))
  }

  const parsed = qualifyLeadQuerySchema.safeParse({
    leadId:      searchParams.get('leadId'),
    withHistory: searchParams.get('withHistory') !== 'false',
  })
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'leadId requerido.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const lead = await getLead(tenant.clinicId, parsed.data.leadId)
  if (!lead) return NextResponse.json(fail('NOT_FOUND', 'Lead no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  const activities = parsed.data.withHistory ? await getLeadActivities(lead.id) : []
  const qualification = await qualifyLead(lead, activities)

  return NextResponse.json(ok({ qualification, aiEnabled: isAIEnabled() }))
})
