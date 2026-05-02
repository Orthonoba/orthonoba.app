import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createLeadSchema } from '@/src/modules/marketing/validators'
import { ok, fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { Lead } from '@/src/types/marketing'

export const GET = withTenant(async (_req, { tenant }) => {
  // TODO: ILeadRepository.findAll(tenant.clinicId, queryParams)
  return NextResponse.json(paginated<Lead>([], 0, 1, 20))
})

export const POST = withTenant(async (req, { tenant }) => {
  const body = await req.json().catch(() => null)
  const parsed = createLeadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  // TODO: ILeadRepository.create({ clinicId: tenant.clinicId, ...parsed.data })
  return NextResponse.json(
    fail('SERVICE_UNAVAILABLE', 'DB not connected.'),
    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
  )
})
