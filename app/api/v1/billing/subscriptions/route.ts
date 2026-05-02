import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { Subscription } from '@/src/types/billing'

export const GET = withTenant(async (_req, { tenant }) => {
  // TODO: ISubscriptionRepository.findByClinic(tenant.clinicId)
  return NextResponse.json(ok<Subscription | null>(null))
})
