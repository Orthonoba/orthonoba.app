import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { emailService } from '@/src/services/email/index'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

const schema = z.object({
  to:       z.union([z.string().email(), z.array(z.string().email()).min(1).max(50)]),
  subject:  z.string().min(1).max(200),
  html:     z.string().min(1).max(100_000),
  text:     z.string().max(10_000).optional(),
  replyTo:  z.string().email().optional(),
  tags:     z.array(z.object({ name: z.string(), value: z.string() })).max(10).optional(),
})

// POST /api/v1/notifications/email — send transactional email
export const POST = withTenant(async (req, { session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const result = await emailService.send(parsed.data)

  if (!result.success) {
    return NextResponse.json(fail('SERVICE_UNAVAILABLE', result.error ?? 'Email no disponible.'), { status: HTTP_STATUS.SERVICE_UNAVAILABLE })
  }

  return NextResponse.json(ok({ messageId: result.id }), { status: 201 })
})
