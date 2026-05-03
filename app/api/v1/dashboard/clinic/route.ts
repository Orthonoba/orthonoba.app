import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getClinicDashboard } from '@/src/services/dashboard/clinic-dashboard'
import { dashboardCache, currentPeriod } from '@/src/modules/dashboard/dashboard-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/dashboard/clinic?period=2024-05&refresh=true
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const period  = searchParams.get('period') ?? currentPeriod()
  const refresh = searchParams.get('refresh') === 'true'

  if (!refresh) {
    const cached = dashboardCache.getClinic(tenant.clinicId, period)
    if (cached) return NextResponse.json(ok(cached))
  }

  const dashboard = await getClinicDashboard(
    tenant.clinicId,
    tenant.clinicName,
    tenant.plan,
    period
  )

  dashboardCache.setClinic(tenant.clinicId, period, dashboard)
  return NextResponse.json(ok(dashboard))
})
