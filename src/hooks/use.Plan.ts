'use client'
import { useClinicStore } from '@/src/store/clinic-store'
import type { PlanTier } from '@/src/types/clinic'

const planRank: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
}

export function usePlan() {
  const clinic = useClinicStore((s) => s.clinic)
  const plan: PlanTier = clinic?.plan ?? 'free'

  function hasAccess(required: PlanTier): boolean {
    return planRank[plan] >= planRank[required]
  }

  function isPro(): boolean {
    return hasAccess('pro')
  }

  function isEnterprise(): boolean {
    return hasAccess('enterprise')
  }

  return { plan, hasAccess, isPro, isEnterprise }
}
