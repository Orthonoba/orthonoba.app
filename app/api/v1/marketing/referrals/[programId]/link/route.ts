import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { generateReferralLink } from '@/src/modules/marketing/campaign-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

type Params = { programId: string }

const schema = z.object({ patientId: z.string().uuid() })

// POST /api/v1/marketing/referrals/:programId/link
export const POST = withTenant<Params>(async (req, { params, tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'patientId requerido.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const link = await generateReferralLink(tenant.clinicId, params.programId, parsed.data.patientId)
  return NextResponse.json(ok(link), { status: 201 })
})
