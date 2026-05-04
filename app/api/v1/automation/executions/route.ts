import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { listExecutions } from '@/src/modules/automation/automation-store'
import { fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { AutomationExecution } from '@/src/types/automation'

// GET /api/v1/automation/executions?ruleId=&status=&limit=
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const data = await listExecutions(tenant.clinicId, {
    ruleId: searchParams.get('ruleId') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    limit:  Number(searchParams.get('limit') ?? '50'),
  })
  return NextResponse.json(paginated<AutomationExecution>(data, data.length, 1, 50))
})
