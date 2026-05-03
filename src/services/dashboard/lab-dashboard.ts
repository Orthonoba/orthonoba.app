import type { LabDashboard } from '@/src/types/dashboard'
import type { PlanTier } from '@/src/types/clinic'
import { compare, calculateProductionTime } from './kpi-calculator'

export async function getLabDashboard(
  labId: string,
  labName: string,
  planTier: PlanTier,
  period: string
): Promise<LabDashboard> {
  const now = new Date().toISOString()

  // TODO: wire to IOrderRepository.findByLab(labId) when DB is connected.
  // All zero-values below are stubs — replace with real queries.

  return {
    labId,
    labName,
    period,
    generatedAt: now,
    planTier,

    pipeline: {
      totalActive: 0,
      byStage: {
        draft: 0,
        submitted: 0,
        acknowledged: 0,
        in_design: 0,
        in_manufacturing: 0,
        quality_check: 0,
        ready_for_delivery: 0,
      },
      overdueCount: 0,
      dueThisWeek: 0,
      backlogValue: 0,
    },

    production: calculateProductionTime([], period),

    quality: {
      overallPassRate: 1,
      revisionRate: 0,
      defectRateByType: {},
      topRevisionReasons: [],
    },

    revenue: {
      periodEurCents: 0,
      comparison: compare(0, 0),
      avgOrderValueEurCents: 0,
      byClient: [],
    },

    technicians: {
      total: 0,
      activeCount: 0,
      avgCasesPerTechnician: 0,
      busiest: null,
    },

    clients: {
      totalClinics: 0,
      activeThisPeriod: 0,
      newThisPeriod: 0,
      churnedThisPeriod: 0,
    },

    delivery: {
      onTimeRate: 1,
      avgDeliveryDays: 0,
      lateCount: 0,
    },
  }
}
