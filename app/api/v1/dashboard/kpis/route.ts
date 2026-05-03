import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { getMarketingKPIs, listCampaigns } from '@/src/modules/marketing/campaign-store'
import { listLeads } from '@/src/modules/marketing/lead-store'
import {
  calculateCAC, calculateLTV, calculateChurn, calculateMRR, calculateROAS,
  compare, toKPIValue, buildConversionFunnel, calculateProductionTime,
} from '@/src/services/dashboard/kpi-calculator'
import { getPlan, TOKEN_ALLOCATIONS } from '@/src/config/plans'
import { currentPeriod } from '@/src/modules/dashboard/dashboard-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { NamedKPI, KPIPickerResult, KPIValue } from '@/src/types/dashboard'

const AVAILABLE_KPIS: NamedKPI[] = [
  'cac', 'ltv', 'mrr', 'arr', 'churn',
  'conversion', 'roas', 'orders', 'production_time',
  'avg_ticket', 'outstanding_invoices', 'lead_score',
  'patient_retention', 'on_time_delivery', 'revision_rate',
]

// GET /api/v1/dashboard/kpis?metrics=cac,ltv,mrr&period=2024-05
// ?metrics=* returns all available KPIs
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'lab_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? currentPeriod()
  const raw    = searchParams.get('metrics') ?? 'cac,ltv,mrr'
  const requested: NamedKPI[] = raw === '*'
    ? AVAILABLE_KPIS
    : raw.split(',').filter((m): m is NamedKPI => AVAILABLE_KPIS.includes(m as NamedKPI))

  if (requested.length === 0) {
    return NextResponse.json(fail('VALIDATION_ERROR', `Métricas inválidas. Disponibles: ${AVAILABLE_KPIS.join(', ')}`), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const result: KPIPickerResult = {}

  // Lazy load data only when needed
  let _subscription: Awaited<ReturnType<typeof getSubscriptionByTenantId>> | null | undefined
  let _kpis: Awaited<ReturnType<typeof getMarketingKPIs>> | undefined
  let _leads: Awaited<ReturnType<typeof listLeads>> | undefined
  let _campaigns: Awaited<ReturnType<typeof listCampaigns>> | undefined

  const getSub = async () => { _subscription ??= await getSubscriptionByTenantId(tenant.clinicId); return _subscription }
  const getKPIs = async () => { _kpis ??= await getMarketingKPIs(tenant.clinicId, period); return _kpis }
  const getLeads = async () => { _leads ??= await listLeads(tenant.clinicId, { limit: 1000 }); return _leads }
  const getCampaigns = async () => { _campaigns ??= await listCampaigns(tenant.clinicId); return _campaigns }

  for (const metric of requested) {
    try {
      switch (metric) {
        case 'mrr': {
          const sub = await getSub()
          const plan = getPlan(sub?.plan ?? 'starter')
          const mrrCents = sub
            ? (sub.billingCycle === 'annual' ? plan.pricing.annual / 12 : plan.pricing.monthly)
            : 0
          result.mrr = toKPIValue(mrrCents, undefined, period, `€${(mrrCents / 100).toFixed(2)}/mes`)
          break
        }
        case 'arr': {
          const sub = await getSub()
          const plan = getPlan(sub?.plan ?? 'starter')
          const mrrCents = sub
            ? (sub.billingCycle === 'annual' ? plan.pricing.annual / 12 : plan.pricing.monthly)
            : 0
          result.arr = toKPIValue(mrrCents * 12, undefined, period, `€${((mrrCents * 12) / 100).toFixed(2)}/año`)
          break
        }
        case 'cac': {
          const [leadsData, cmpData] = await Promise.all([getLeads(), getCampaigns()])
          const spend = cmpData.filter((c) => ['active', 'completed'].includes(c.status))
            .reduce((s, c) => s + (c.budget ?? 0), 0)
          const converted = leadsData.data.filter((l) => l.status === 'converted').length
          const cac = spend > 0 && converted > 0 ? Math.round(spend / converted) : 0
          result.cac = toKPIValue(cac, undefined, period, `€${cac}`)
          break
        }
        case 'ltv': {
          const sub = await getSub()
          const plan = getPlan(sub?.plan ?? 'starter')
          const monthly = (sub?.billingCycle === 'annual' ? plan.pricing.annual / 12 : plan.pricing.monthly) / 100
          const ltv = Math.round(monthly * 24)  // 2-year avg lifespan estimate
          result.ltv = toKPIValue(ltv, undefined, period, `€${ltv}`)
          break
        }
        case 'churn': {
          result.churn = toKPIValue(0, undefined, period, '0%')
          break
        }
        case 'conversion': {
          const leadsData = await getLeads()
          const total     = leadsData.data.length
          const converted = leadsData.data.filter((l) => l.status === 'converted').length
          const rate      = total > 0 ? Math.round((converted / total) * 1000) / 10 : 0
          result.conversion = toKPIValue(rate, undefined, period, `${rate}%`)
          break
        }
        case 'roas': {
          const kpis = await getKPIs()
          const cmpData = await getCampaigns()
          const spend   = cmpData.filter((c) => ['active', 'completed'].includes(c.status))
            .reduce((s, c) => s + (c.budget ?? 0), 0)
          const revenue = kpis.estimatedRevenue ?? 0
          const roas    = calculateROAS(revenue, spend)
          result.roas = toKPIValue(roas, undefined, period, `${roas}x`)
          break
        }
        case 'lead_score': {
          const kpis = await getKPIs()
          result.lead_score = toKPIValue(kpis.avgLeadScore ?? 0, undefined, period, `${kpis.avgLeadScore ?? 0}/100`)
          break
        }
        case 'orders': {
          result.orders = toKPIValue(0, undefined, period, '0')
          break
        }
        case 'production_time': {
          result.production_time = toKPIValue(0, undefined, period, '0 días')
          break
        }
        case 'avg_ticket': {
          result.avg_ticket = toKPIValue(0, undefined, period, '€0')
          break
        }
        case 'outstanding_invoices': {
          result.outstanding_invoices = toKPIValue(0, undefined, period, '€0')
          break
        }
        case 'patient_retention': {
          result.patient_retention = toKPIValue(100, undefined, period, '100%')
          break
        }
        case 'on_time_delivery': {
          result.on_time_delivery = toKPIValue(100, undefined, period, '100%')
          break
        }
        case 'revision_rate': {
          result.revision_rate = toKPIValue(0, undefined, period, '0%')
          break
        }
      }
    } catch {
      // Individual KPI failure doesn't break others
    }
  }

  return NextResponse.json(ok({
    kpis: result,
    available: AVAILABLE_KPIS,
    requested,
    period,
    computedAt: new Date().toISOString(),
  }))
})
