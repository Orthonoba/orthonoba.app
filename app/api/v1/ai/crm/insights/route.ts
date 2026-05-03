import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { buildCRMReport } from '@/src/services/ai/retention-engine'
import { getMarketingKPIs } from '@/src/modules/marketing/campaign-store'
import { listRules, listExecutions } from '@/src/modules/automation/automation-store'
import { isAIEnabled } from '@/src/services/ai/provider'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/ai/crm/insights?period=2024-05
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? new Date().toISOString().slice(0, 7)

  const [kpis, rules, execs] = await Promise.all([
    getMarketingKPIs(tenant.clinicId, period),
    listRules(tenant.clinicId),
    listExecutions(tenant.clinicId, { limit: 100 }),
  ])

  const activeRules = rules.filter((r) => r.status === 'active').length
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()
  const execsLast7d  = execs.filter((e) => e.startedAt >= sevenDaysAgo).length

  const report = await buildCRMReport(tenant.clinicId, period, [], kpis, activeRules, execsLast7d)

  return NextResponse.json(ok({ report, aiEnabled: isAIEnabled() }))
})
