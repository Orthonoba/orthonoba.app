import type { ExecutiveReport, PlatformTenantSummary } from '@/src/types/dashboard'
import { listSubscriptions } from '@/src/modules/billing/subscription-store'
import { listAllRules, listAllExecutions } from '@/src/modules/automation/automation-store'
import { listCourses } from '@/src/modules/academy/course-store'
import { listCourseStudents } from '@/src/modules/academy/enrollment-store'
import { calculateMRR, compare } from './kpi-calculator'
import { getPlan } from '@/src/config/plans'
import type { PlanTier } from '@/src/types/clinic'
import { isAIEnabled } from '@/src/services/ai/provider'
import { getClinicById } from '@/src/lib/mock-clinics'

export async function getExecutiveReport(period: string): Promise<ExecutiveReport> {
  const now = new Date().toISOString()
  const periodStart = `${period}-01`

  const [subsResult, allRules, allExecutions, coursesResult] = await Promise.all([
    listSubscriptions(1000),
    listAllRules(),
    listAllExecutions({ limit: 1000 }),
    listCourses({ status: 'published', limit: 1000 }),
  ])

  const allSubs = subsResult.data
  const activeSubs = allSubs.filter((s) => ['active', 'trialing'].includes(s.status))

  // MRR per subscription
  const mrrValues = activeSubs.map((sub) => {
    const plan = getPlan(sub.plan)
    return sub.billingCycle === 'annual'
      ? plan.pricing.annual / 12
      : plan.pricing.monthly
  })

  const mrr = calculateMRR(mrrValues, period)

  // Plan distribution
  const planTiers: PlanTier[] = ['starter', 'growth', 'scale', 'enterprise']
  const planDistribution = planTiers.reduce((acc, tier) => {
    const tierSubs = activeSubs.filter((s) => s.plan === tier)
    const tierMRR  = tierSubs.reduce((s, sub) => {
      const plan = getPlan(sub.plan)
      return s + (sub.billingCycle === 'annual' ? plan.pricing.annual / 12 : plan.pricing.monthly)
    }, 0)
    acc[tier] = {
      count: tierSubs.length,
      percent: activeSubs.length > 0 ? Math.round((tierSubs.length / activeSubs.length) * 1000) / 10 : 0,
      mrrEurCents: tierMRR,
    }
    return acc
  }, {} as ExecutiveReport['planDistribution'])

  // Top tenants by MRR
  const topTenants: PlatformTenantSummary[] = activeSubs
    .map((sub) => {
      const plan = getPlan(sub.plan)
      const mrrCents = sub.billingCycle === 'annual' ? plan.pricing.annual / 12 : plan.pricing.monthly
      return {
        tenantId:    sub.tenantId,
        tenantName:  getClinicById(sub.tenantId)?.name ?? sub.tenantId,
        tenantType:  sub.tenantType,
        plan:        sub.plan,
        status:      sub.status,
        mrrEurCents: mrrCents,
        createdAt:   sub.createdAt,
        orderCount:  0,
      }
    })
    .sort((a, b) => b.mrrEurCents - a.mrrEurCents)
    .slice(0, 10)

  // Growth
  const newThisPeriod     = allSubs.filter((s) => s.createdAt >= periodStart).length
  const churnedThisPeriod = allSubs.filter((s) => s.cancelledAt && s.cancelledAt >= periodStart).length

  // Academy totals
  const courses = coursesResult.data
  let totalEnrollments = 0
  for (const course of courses) {
    const students = await listCourseStudents(course.id)
    totalEnrollments += students.length
  }

  // Automation health
  const periodExecs = allExecutions.filter((e) => e.startedAt >= periodStart)
  const successRate = periodExecs.length > 0
    ? periodExecs.filter((e) => e.status === 'completed').length / periodExecs.length
    : 1

  const clinics = activeSubs.filter((s) => s.tenantType === 'clinic').length
  const labs    = activeSubs.filter((s) => s.tenantType === 'lab').length

  return {
    generatedAt: now,
    period,

    platform: {
      totalMRREurCents: mrr.mrr,
      totalARREurCents: mrr.arr,
      activeTenants: activeSubs.length,
      clinics,
      labs,
      mrrComparison: compare(mrr.mrr, 0),
      mrrByPlan: {
        starter:    planDistribution.starter?.mrrEurCents ?? 0,
        growth:     planDistribution.growth?.mrrEurCents ?? 0,
        scale:      planDistribution.scale?.mrrEurCents ?? 0,
        enterprise: planDistribution.enterprise?.mrrEurCents ?? 0,
      },
    },

    growth: {
      newTenantsThisPeriod: newThisPeriod,
      churnedTenantsThisPeriod: churnedThisPeriod,
      netNewTenants: newThisPeriod - churnedThisPeriod,
      growthRate: activeSubs.length > 0 ? newThisPeriod / activeSubs.length : 0,
      trialToPaidRate: 0,  // TODO: historical cohort analysis
    },

    topTenants,
    planDistribution,

    academy: {
      totalCourses: courses.length,
      totalEnrollments,
      totalCertificates: 0,   // TODO: platform-wide certificate count
      totalRevenueEurCents: 0,
      avgCompletionRate: 0,
    },

    platform_health: {
      totalAutomationRules: allRules.length,
      executionsThisPeriod: periodExecs.length,
      automationSuccessRate: successRate,
      aiEnabled: isAIEnabled(),
      totalAITasksThisPeriod: 0,
    },

    revenue: {
      totalPeriodEurCents: mrr.mrr,
      comparison: compare(mrr.mrr, 0),
      byPlan: {
        starter:    planDistribution.starter?.mrrEurCents ?? 0,
        growth:     planDistribution.growth?.mrrEurCents ?? 0,
        scale:      planDistribution.scale?.mrrEurCents ?? 0,
        enterprise: planDistribution.enterprise?.mrrEurCents ?? 0,
      },
    },
  }
}
