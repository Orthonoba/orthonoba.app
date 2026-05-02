import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getMarketingKPIs } from '@/src/modules/marketing/campaign-store'
import { listLeads } from '@/src/modules/marketing/lead-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/marketing/analytics?period=2024-05
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? new Date().toISOString().slice(0, 7)

  const [kpis, leadsResult] = await Promise.all([
    getMarketingKPIs(tenant.clinicId, period),
    listLeads(tenant.clinicId, { limit: 1000 }),
  ])

  const leads = leadsResult.data
  const totalLeads     = leads.length
  const newLeads       = leads.filter((l) => l.status === 'new').length
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length
  const convertedLeads = leads.filter((l) => l.status === 'converted').length

  const sourceMap = leads.reduce<Record<string, { leads: number; conversions: number }>>(
    (acc, l) => {
      if (!acc[l.source]) acc[l.source] = { leads: 0, conversions: 0 }
      acc[l.source].leads++
      if (l.status === 'converted') acc[l.source].conversions++
      return acc
    }, {}
  )

  const avgScore = leads.filter((l) => l.score != null).length > 0
    ? leads.reduce((s, l) => s + (l.score ?? 0), 0) / leads.filter((l) => l.score != null).length
    : 0

  return NextResponse.json(
    ok({
      ...kpis,
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      conversionRate: totalLeads > 0 ? convertedLeads / totalLeads : 0,
      avgLeadScore: Math.round(avgScore),
      topSources: Object.entries(sourceMap)
        .map(([source, stats]) => ({ source, ...stats }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5),
    })
  )
})
