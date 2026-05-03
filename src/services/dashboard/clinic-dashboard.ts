import type { ClinicDashboard } from '@/src/types/dashboard'
import type { PlanTier } from '@/src/types/clinic'
import { listLeads } from '@/src/modules/marketing/lead-store'
import { getMarketingKPIs, listCampaigns } from '@/src/modules/marketing/campaign-store'
import { listRules, listExecutions, listReminders } from '@/src/modules/automation/automation-store'
import {
  compare, calculateCAC, buildConversionFunnel, calculateProductionTime, toKPIValue,
} from './kpi-calculator'
import { isAIEnabled } from '@/src/services/ai/provider'

export async function getClinicDashboard(
  clinicId: string,
  clinicName: string,
  planTier: PlanTier,
  period: string
): Promise<ClinicDashboard> {
  const now = new Date().toISOString()

  const [
    leadsResult,
    marketingKPIs,
    campaigns,
    rules,
    executions,
    reminders,
  ] = await Promise.all([
    listLeads(clinicId, { limit: 1000 }),
    getMarketingKPIs(clinicId, period),
    listCampaigns(clinicId),
    listRules(clinicId),
    listExecutions(clinicId, { limit: 500 }),
    listReminders(clinicId),
  ])

  const leads = leadsResult.data

  // Lead funnel counts
  const stageCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})
  const funnel = buildConversionFunnel(stageCounts)

  // CAC
  const totalSpendEur = campaigns
    .filter((c) => c.status === 'active' || c.status === 'completed')
    .reduce((s, c) => s + (c.budget ?? 0), 0)
  const newCustomers = stageCounts['converted'] ?? 0
  const cac = calculateCAC(totalSpendEur, newCustomers, period)

  // Automation health
  const activeRules = rules.filter((r) => r.status === 'active').length
  const periodStart  = `${period}-01`
  const periodExecs  = executions.filter((e) => e.startedAt >= periodStart)
  const successExecs = periodExecs.filter((e) => e.status === 'completed').length
  const successRate  = periodExecs.length > 0 ? successExecs / periodExecs.length : 1
  const pending      = reminders.filter((r) => r.status === 'scheduled').length

  // Hot leads
  const hotLeadsCount = leads.filter((l) => l.scoreGrade === 'A').length
  const avgLeadScore  = leads.filter((l) => l.score != null).length > 0
    ? Math.round(leads.reduce((s, l) => s + (l.score ?? 0), 0) / leads.filter((l) => l.score != null).length)
    : 0

  return {
    clinicId,
    clinicName,
    period,
    generatedAt: now,
    planTier,

    orders: {
      total: 0,
      active: 0,
      completed: 0,
      overdue: 0,
      pendingPickup: 0,
      byStatus: {},
      byType: {},
      comparison: compare(0, 0),
    },

    productionTime: calculateProductionTime([], period),

    revenue: {
      periodEurCents: 0,
      comparison: compare(0, 0),
      avgTicketEurCents: 0,
      pendingInvoicesEurCents: 0,
      pendingInvoicesCount: 0,
    },

    patients: {
      total: 0,
      newThisPeriod: 0,
      activeWithTreatmentPlan: 0,
      atRiskCount: 0,
      retentionRate: 1,
      avgLifetimeValueEur: 800,
    },

    leads: {
      total: leads.length,
      newThisPeriod: leads.filter((l) => l.createdAt >= periodStart).length,
      funnel,
      cac,
      hotLeadsCount,
      avgLeadScore,
    },

    academy: {
      totalEnrollments: 0,
      completedCourses: 0,
      certificatesIssued: 0,
      avgCompletionRate: 0,
    },

    automation: {
      activeRules,
      executionsThisPeriod: periodExecs.length,
      successRate,
      pendingReminders: pending,
    },

    aiHealth: {
      aiEnabled: isAIEnabled(),
      qualificationsThisPeriod: 0,
      avgConfidence: 0.85,
    },
  }
}
