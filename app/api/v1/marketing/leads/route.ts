import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createLeadSchema } from '@/src/modules/marketing/validators'
import { createLead, listLeads } from '@/src/modules/marketing/lead-store'
import { ok, fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Lead } from '@/src/types/marketing'

// GET /api/v1/marketing/leads
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const filters = {
    status:     (searchParams.get('status') as Lead['status']) ?? undefined,
    source:     (searchParams.get('source') as Lead['source']) ?? undefined,
    assignedTo: searchParams.get('assignedTo') ?? undefined,
    campaignId: searchParams.get('campaignId') ?? undefined,
    scoreGrade: (searchParams.get('grade') as 'A' | 'B' | 'C' | 'D') ?? undefined,
    search:     searchParams.get('q') ?? undefined,
    page:       Number(searchParams.get('page') ?? '1'),
    limit:      Number(searchParams.get('limit') ?? '20'),
  }
  const { data, total } = await listLeads(tenant.clinicId, filters)
  return NextResponse.json(paginated<Lead>(data, total, filters.page, filters.limit))
})

// POST /api/v1/marketing/leads — public-facing (no auth required for lead capture)
export async function POST(req: NextRequest) {
  const clinicId = req.headers.get('x-clinic-id')
  if (!clinicId) {
    return NextResponse.json(fail('TENANT_REQUIRED', 'Tenant requerido.'), { status: 400 })
  }
  const body = await req.json().catch(() => null)
  const parsed = createLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: 422 })
  }
  const lead = await createLead({ ...parsed.data, clinicId, status: 'new' })
  return NextResponse.json(ok(lead), { status: 201 })
}
