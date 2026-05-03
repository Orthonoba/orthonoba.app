import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getExecutiveReport } from '@/src/services/dashboard/executive-report'
import { dashboardCache, currentPeriod } from '@/src/modules/dashboard/dashboard-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/dashboard/executive?period=2024-05 — super_admin only
export const GET = withTenant(async (req, { session }) => {
  if (session.role !== 'super_admin') {
    return NextResponse.json(fail('FORBIDDEN', 'Solo super_admin puede ver el reporte ejecutivo.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const period  = searchParams.get('period') ?? currentPeriod()
  const refresh = searchParams.get('refresh') === 'true'

  if (!refresh) {
    const cached = dashboardCache.getExecutive(period)
    if (cached) return NextResponse.json(ok(cached))
  }

  const report = await getExecutiveReport(period)
  dashboardCache.setExecutive(period, report)
  return NextResponse.json(ok(report))
})
