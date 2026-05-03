// ─── Pure KPI calculator — zero side effects, zero store imports ──────────────
// All functions take plain data and return computed values.

import type { KPIValue, PeriodComparison, MRRBreakdown, CACKpi, LTVKpi, ChurnKpi, ConversionFunnel, FunnelStage, ProductionTimeKpi } from '@/src/types/dashboard'

// ─── Period comparison ────────────────────────────────────────────────────────

export function compare(current: number, previous: number): PeriodComparison {
  const changePercent = previous === 0
    ? (current > 0 ? 100 : 0)
    : ((current - previous) / previous) * 100

  return {
    current,
    previous,
    changePercent: Math.round(changePercent * 10) / 10,
    trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
  }
}

export function toKPIValue(
  value: number,
  previousValue: number | undefined,
  period: string,
  formattedValue?: string
): KPIValue {
  const comparison = previousValue !== undefined ? compare(value, previousValue) : undefined
  return {
    value,
    previousValue,
    changePercent: comparison?.changePercent,
    trend: comparison?.trend ?? 'stable',
    period,
    formattedValue,
  }
}

// ─── Revenue KPIs ─────────────────────────────────────────────────────────────

export function calculateMRR(
  activeSubscriptionAmountsCents: number[],
  period: string
): MRRBreakdown {
  const mrr = activeSubscriptionAmountsCents.reduce((s, a) => s + a, 0)
  return {
    mrr,
    arr: mrr * 12,
    newMRR: 0,       // requires historical data — populated by dashboard service
    expansionMRR: 0,
    churnedMRR: 0,
    netNewMRR: 0,
    period,
  }
}

export function calculateARR(mrr: number): number {
  return mrr * 12
}

// ─── CAC ─────────────────────────────────────────────────────────────────────

export function calculateCAC(
  totalMarketingSpendEur: number,
  newCustomers: number,
  period: string
): CACKpi {
  return {
    cac: newCustomers > 0 ? Math.round(totalMarketingSpendEur / newCustomers) : 0,
    totalSpend: totalMarketingSpendEur,
    newCustomers,
    period,
  }
}

// ─── LTV ─────────────────────────────────────────────────────────────────────

export function calculateLTV(
  avgMonthlyRevenueEur: number,
  monthlyChurnRate: number,
  cacEur?: number
): LTVKpi {
  const avgLifespanMonths = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : 36
  const ltv = Math.round(avgMonthlyRevenueEur * avgLifespanMonths)
  return {
    ltv,
    avgMonthlyRevenue: avgMonthlyRevenueEur,
    avgLifespanMonths: Math.round(avgLifespanMonths),
    ltvToCacRatio: cacEur && cacEur > 0 ? Math.round((ltv / cacEur) * 10) / 10 : undefined,
  }
}

// ─── Churn ───────────────────────────────────────────────────────────────────

export function calculateChurn(
  churnedCount: number,
  totalSubscriptions: number,
  revenueChurnedCents: number,
  atRiskCount: number
): ChurnKpi {
  const monthlyChurnRate = totalSubscriptions > 0 ? churnedCount / totalSubscriptions : 0
  return {
    monthlyChurnRate: Math.round(monthlyChurnRate * 1000) / 1000,
    churnedCount,
    revenueChurned: revenueChurnedCents,
    atRiskCount,
  }
}

// ─── Conversion funnel ────────────────────────────────────────────────────────

export function buildConversionFunnel(stageCounts: Record<string, number>): ConversionFunnel {
  const stageOrder = ['new', 'contacted', 'qualified', 'appointment-scheduled', 'converted']
  const stages: FunnelStage[] = []
  let prevCount = 0

  for (const stageName of stageOrder) {
    const count = stageCounts[stageName] ?? 0
    stages.push({
      name: stageName,
      count,
      conversionFromPrevious: prevCount > 0 ? count / prevCount : undefined,
      dropoffRate: prevCount > 0 ? 1 - count / prevCount : undefined,
    })
    prevCount = count
  }

  const total    = stageCounts['new'] ?? 0
  const converted = stageCounts['converted'] ?? 0
  const avgDays  = 14 // TODO: compute from actual lead activity timestamps

  return {
    stages,
    overallConversionRate: total > 0 ? converted / total : 0,
    avgConversionDays: avgDays,
  }
}

// ─── ROAS ────────────────────────────────────────────────────────────────────

export function calculateROAS(revenueEur: number, adSpendEur: number): number {
  return adSpendEur > 0 ? Math.round((revenueEur / adSpendEur) * 100) / 100 : 0
}

// ─── Production time ──────────────────────────────────────────────────────────

interface OrderTimingData {
  type: string
  createdAt: string
  deliveredAt?: string
  isOnTime: boolean
  hasRevision: boolean
  passedQC: boolean
}

export function calculateProductionTime(
  orders: OrderTimingData[],
  period: string,
  previousAvgDays?: number
): ProductionTimeKpi {
  const completed = orders.filter((o) => o.deliveredAt)

  const durations = completed.map((o) => {
    const ms = new Date(o.deliveredAt!).getTime() - new Date(o.createdAt).getTime()
    return ms / 86_400_000
  }).sort((a, b) => a - b)

  const avg    = durations.length > 0 ? durations.reduce((s, d) => s + d, 0) / durations.length : 0
  const median = durations.length > 0 ? durations[Math.floor(durations.length / 2)]! : 0

  const onTimeRate    = orders.length > 0 ? orders.filter((o) => o.isOnTime).length / orders.length : 1
  const qualityPass   = orders.length > 0 ? orders.filter((o) => o.passedQC).length / orders.length : 1
  const revisionRate  = orders.length > 0 ? orders.filter((o) => o.hasRevision).length / orders.length : 0

  const byType: Record<string, { avgDays: number; count: number }> = {}
  for (const o of completed) {
    if (!byType[o.type]) byType[o.type] = { avgDays: 0, count: 0 }
    const days = (new Date(o.deliveredAt!).getTime() - new Date(o.createdAt).getTime()) / 86_400_000
    const prev = byType[o.type]!
    byType[o.type] = {
      count: prev.count + 1,
      avgDays: (prev.avgDays * prev.count + days) / (prev.count + 1),
    }
  }

  return {
    avgTurnaroundDays: Math.round(avg * 10) / 10,
    medianTurnaroundDays: Math.round(median * 10) / 10,
    onTimeRate: Math.round(onTimeRate * 1000) / 1000,
    qualityPassRate: Math.round(qualityPass * 1000) / 1000,
    revisionRate: Math.round(revisionRate * 1000) / 1000,
    trend: previousAvgDays !== undefined ? compare(avg, previousAvgDays) : compare(avg, avg),
    byType,
  }
}

// ─── NPS ─────────────────────────────────────────────────────────────────────

export function calculateNPS(
  promoters: number,   // rating 9–10
  detractors: number,  // rating 0–6
  total: number
): number {
  if (total === 0) return 0
  return Math.round(((promoters - detractors) / total) * 100)
}

// ─── Patient retention ────────────────────────────────────────────────────────

export function calculateRetentionRate(
  activeAtStart: number,
  activeAtEnd: number,
  newCustomers: number
): number {
  if (activeAtStart === 0) return 1
  const retained = activeAtEnd - newCustomers
  return Math.max(0, Math.min(1, retained / activeAtStart))
}

// ─── Avg ticket ──────────────────────────────────────────────────────────────

export function calculateAvgTicket(totalRevenueCents: number, orderCount: number): number {
  return orderCount > 0 ? Math.round(totalRevenueCents / orderCount) : 0
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatEUR(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}
