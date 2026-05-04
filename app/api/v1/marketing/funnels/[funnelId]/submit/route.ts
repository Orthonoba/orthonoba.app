import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { funnelSubmitSchema } from '@/src/modules/marketing/validators'
import { getFunnel, recordFunnelSubmission } from '@/src/modules/marketing/campaign-store'
import { createLead } from '@/src/modules/marketing/lead-store'
import { ok, fail } from '@/src/types/api'
import type { LeadSource } from '@/src/types/marketing'

type Params = { funnelId: string }

function inferSource(utm?: { source?: string }): LeadSource {
  const src = utm?.source ?? ''
  if (src.startsWith('google')) return 'google-ads'
  if (src === 'facebook')       return 'facebook'
  if (src === 'instagram')      return 'instagram'
  if (src === 'email')          return 'email-campaign'
  return 'website-form'
}

// POST /api/v1/marketing/funnels/:id/submit — public, no auth required
export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { funnelId } = await params
  const clinicId = req.headers.get('x-clinic-id')
  if (!clinicId) return NextResponse.json(fail('TENANT_REQUIRED', 'Tenant requerido.'), { status: 400 })

  const funnel = await getFunnel(clinicId, funnelId)
  if (!funnel || !funnel.isActive) {
    return NextResponse.json(fail('NOT_FOUND', 'Funnel no encontrado o inactivo.'), { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = funnelSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: 422 })
  }

  const { data, utm, referrer } = parsed.data

  const lead = await createLead({
    clinicId,
    name:   String(data['name'] ?? data['nombre'] ?? 'Lead'),
    email:  data['email'] ? String(data['email']) : undefined,
    phone:  data['phone'] ? String(data['phone']) : data['telefono'] ? String(data['telefono']) : undefined,
    status: 'new',
    source: inferSource(utm),
    funnelId,
    utm,
    notes: data['notes'] ? String(data['notes']) : data['message'] ? String(data['message']) : undefined,
  })

  const submission = await recordFunnelSubmission({
    funnelId,
    clinicId,
    leadId: lead.id,
    data:   Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    utm:    utm ?? undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
    referrer:  referrer ?? req.headers.get('referer') ?? undefined,
    submittedAt: new Date().toISOString(),
  })

  return NextResponse.json(ok({ submitted: true, leadId: lead.id, submissionId: submission.id }), { status: 201 })
}
