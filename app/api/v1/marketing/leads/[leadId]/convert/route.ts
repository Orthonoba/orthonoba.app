import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getLead, updateLead } from '@/src/modules/marketing/lead-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

type Params = { leadId: string }

// POST /api/v1/marketing/leads/:id/convert — convert lead to patient
export const POST = withTenant<Params>(async (_req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const lead = await getLead(tenant.clinicId, params.leadId)
  if (!lead) return NextResponse.json(fail('NOT_FOUND', 'Lead no encontrado.'), { status: HTTP_STATUS.NOT_FOUND })

  if (lead.status === 'converted') {
    return NextResponse.json(fail('CONFLICT', 'Lead ya convertido.'), { status: HTTP_STATUS.CONFLICT })
  }

  // TODO: IPatientRepository.create({ name: lead.name, email: lead.email, ... })
  const patientId = crypto.randomUUID()  // stub
  const now = new Date().toISOString()

  const updated = await updateLead(tenant.clinicId, params.leadId, {
    status: 'converted',
    convertedPatientId: patientId,
    convertedAt: now,
  })

  return NextResponse.json(ok({ lead: updated, patientId }), { status: 201 })
})
