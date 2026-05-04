import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getLeadScore, refreshLeadScore, addLeadActivity } from '@/src/modules/marketing/lead-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

type Params = { leadId: string }

// GET — return current score
export const GET = withTenant<Params>(async (_req, { params, tenant: _tenant }) => {
  const score = await getLeadScore(params.leadId)
  return NextResponse.json(ok(score))
})

const activitySchema = z.object({
  type: z.enum(['form_submitted', 'page_visited', 'email_opened', 'email_clicked', 'whatsapp_received',
    'phone_call', 'appointment_booked', 'appointment_attended', 'appointment_no_show', 'note_added', 'status_changed']),
  description: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// POST — log activity + recalculate score
export const POST = withTenant<Params>(async (req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = activitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  await addLeadActivity({ leadId: params.leadId, clinicId: tenant.clinicId, ...parsed.data, occurredAt: new Date().toISOString() })
  const score = await refreshLeadScore(params.leadId)
  return NextResponse.json(ok(score))
})
