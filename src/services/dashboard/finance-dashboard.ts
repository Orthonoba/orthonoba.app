import type { FinanceDashboard } from '@/src/types/dashboard'
import type { TenantType } from '@/src/types/clinic'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { getClinicById } from '@/src/lib/mock-clinics'
import { getMarketingKPIs, listCampaigns } from '@/src/modules/marketing/campaign-store'
import { listLeads } from '@/src/modules/marketing/lead-store'
import { getPlan, TOKEN_ALLOCATIONS, PLANS } from '@/src/config/plans'
import {
  calculateCAC, calculateLTV, calculateChurn, calculateMRR, compare,
} from './kpi-calculator'

export async function getFinanceDashboard(
  tenantId: string,
  tenantType: TenantType,
  period: string
): Promise<FinanceDashboard> {
  const now = new Date().toISOString()

  const [subscription, marketingKPIs, campaigns, leadsResult] = await Promise.all([
    getSubscriptionByTenantId(tenantId),
    getMarketingKPIs(tenantId, period),
    listCampaigns(tenantId),
    listLeads(tenantId, { limit: 1000 }),
  ])

  const planTier = subscription?.plan ?? getClinicById(tenantId)?.plan ?? 'starter'
  const planConfig = getPlan(planTier)

  // MRR from subscription
  const monthlyAmountCents = subscription
    ? (subscription.billingCycle === 'annual'
        ? planConfig.pricing.annual / 12
        : planConfig.pricing.monthly)
    : 0

  const mrr = calculateMRR([monthlyAmountCents], period)

  // Churn (stub — requires historical subscription data)
  const churn = calculateChurn(0, 1, 0, 0)

  // CAC
  const totalSpendEur = campaigns
    .filter((c) => ['active', 'completed'].includes(c.status))
    .reduce((s, c) => s + (c.budget ?? 0), 0)
  const convertedLeads = leadsResult.data.filter((l) => l.status === 'converted').length
  const cac = calculateCAC(totalSpendEur, convertedLeads, period)

  // LTV
  const avgMonthlyRevenueEur = monthlyAmountCents / 100
  const ltv = calculateLTV(avgMonthlyRevenueEur, churn.monthlyChurnRate, cac.cac)

  // Token data
  const tokenAlloc = TOKEN_ALLOCATIONS[planTier]
  const tokenData = tokenAlloc !== -1
    ? {
        monthlyAllocation: tokenAlloc,
        usedThisMonth: 0,    // TODO: from usage records
        usagePercent: 0,
        purchasedBalance: 0,
        estimatedDaysRemaining: 30,
      }
    : null

  // Subscription details
  const subscriptionData = subscription
    ? {
        plan: subscription.plan,
        billingCycle: subscription.billingCycle,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        monthlyAmountEurCents: monthlyAmountCents,
        annualSavingsEurCents: planConfig.pricing.monthly * 12 - planConfig.pricing.annual,
      }
    : null

  return {
    tenantId,
    tenantType,
    period,
    generatedAt: now,
    planTier,

    mrr: { ...mrr, newMRR: monthlyAmountCents, netNewMRR: monthlyAmountCents },
    churn,
    ltv,
    cac,

    subscription: subscriptionData,

    invoices: {
      totalOutstandingEurCents: 0,
      outstandingCount: 0,
      overdueEurCents: 0,
      overdueCount: 0,
      paidThisPeriodEurCents: 0,
      paidThisPeriodCount: 0,
    },

    tokens: tokenData,

    revenueByMonth: generateRevenueByMonth(monthlyAmountCents, period),

    paymentHealth: {
      successRate: 1,
      failedPaymentsCount: 0,
      avgDaysToPay: 0,
    },
  }
}

function generateRevenueByMonth(monthlyAmountCents: number, currentPeriod: string): { month: string; revenueEurCents: number }[] {
  const months: { month: string; revenueEurCents: number }[] = []
  const [year, month] = currentPeriod.split('-').map(Number)

  for (let i = 5; i >= 0; i--) {
    const d = new Date((year ?? 2024), (month ?? 1) - 1 - i, 1)
    months.push({
      month: d.toISOString().slice(0, 7),
      revenueEurCents: monthlyAmountCents,
    })
  }
  return months
}
