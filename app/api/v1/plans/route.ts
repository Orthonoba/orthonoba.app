import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getPlansForTenantType, getAnnualSavings } from '@/src/config/plans'
import { ok } from '@/src/types/api'
import type { TenantType } from '@/src/types/clinic'

// GET /api/v1/plans — public, returns plan catalog
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantType = (searchParams.get('type') ?? 'clinic') as TenantType

  const plans = getPlansForTenantType(tenantType).map((plan) => ({
    ...plan,
    annualSavingsEurCents: getAnnualSavings(plan.id),
    // Never expose internal Stripe price IDs to the public
    stripeIds: undefined,
  }))

  return NextResponse.json(ok(plans), {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
