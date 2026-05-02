import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/src/lib/auth-service'
import { createSession } from '@/src/lib/auth'
import { loginSchema } from '@/src/modules/auth/validators'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { withRateLimit } from '@/src/middleware/rate-limit'

export const POST = withRateLimit('auth', async (req: NextRequest) => {
  const body = await req.json().catch(() => null)

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()),
      { status: HTTP_STATUS.VALIDATION_ERROR }
    )
  }

  const result = await authService.login(parsed.data)

  if (!result.ok || !result.sessionPayload) {
    return NextResponse.json(
      fail('UNAUTHORIZED', result.error ?? 'Credenciales inválidas.'),
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  await createSession(result.sessionPayload)

  return NextResponse.json(ok({ user: result.user }), { status: 200 })
})
