import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createRuleSchema } from '@/src/modules/automation/validators'
import { createRule, listRules } from '@/src/modules/automation/automation-store'
import { ok, fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { AutomationRule } from '@/src/types/automation'

// GET /api/v1/automation/rules
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')

  let data = await listRules(tenant.clinicId)
  if (statusFilter) data = data.filter((r) => r.status === statusFilter)

  return NextResponse.json(paginated<AutomationRule>(data, data.length, 1, 100))
})

// POST /api/v1/automation/rules
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createRuleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const rule = await createRule({ ...parsed.data, clinicId: tenant.clinicId })
  return NextResponse.json(ok(rule), { status: 201 })
})
