'use client'
import { useClinicStore } from '@/src/store/clinic-store'
import type { PlanTier } from '@/src/types/clinic'

const planRank: Record<PlanTier, number> = {
  starter:    0,
  growth:     1,
  scale:      2,
  enterprise: 3,
}

export function usePlan() {
  const clinic = useClinicStore((s) => s.clinic)
  const plan: PlanTier = clinic?.plan ?? 'starter'

  function hasAccess(required: PlanTier): boolean {
    return planRank[plan] >= planRank[required]
  }

  function isGrowth(): boolean {
    return hasAccess('growth')
  }

  function isScale(): boolean {
    return hasAccess('scale')
  }

  function isEnterprise(): boolean {
    return hasAccess('enterprise')
  }

  return { plan, hasAccess, isGrowth, isScale, isEnterprise }
}
